package db

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

type PostgresStore struct {
	pool *pgxpool.Pool
}

func NewPostgresStore(databaseUrl string) (*PostgresStore, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(databaseUrl)
	if err != nil {
		return nil, fmt.Errorf("invalid database URL: %w", err)
	}

	config.MaxConns = 15
	config.MinConns = 2
	config.MaxConnLifetime = 1 * time.Hour

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to postgres: %w", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("postgres ping failed: %w", err)
	}

	store := &PostgresStore{pool: pool}
	if err := store.autoMigrate(ctx); err != nil {
		fmt.Printf("[Postgres AutoMigrate Warning] %v\n", err)
	}

	return store, nil
}

func (p *PostgresStore) autoMigrate(ctx context.Context) error {
	ddl := `
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

	CREATE TABLE IF NOT EXISTS cafes (
		cafe_id VARCHAR(64) PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		tagline TEXT,
		venue_type VARCHAR(64) DEFAULT 'cafe',
		icon VARCHAR(16) DEFAULT '☕',
		location TEXT NOT NULL,
		phone VARCHAR(32) NOT NULL,
		default_table_id VARCHAR(32) DEFAULT 'table-01',
		specialty_item_ids TEXT[] DEFAULT '{}',
		theme JSONB NOT NULL DEFAULT '{}'::jsonb,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS menu_items (
		item_id VARCHAR(64) PRIMARY KEY,
		cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE CASCADE,
		name VARCHAR(255) NOT NULL,
		price INT NOT NULL,
		category VARCHAR(64) NOT NULL,
		available BOOLEAN DEFAULT TRUE,
		tags TEXT[] DEFAULT '{}',
		image TEXT,
		description TEXT,
		sizes JSONB DEFAULT '[]'::jsonb,
		milk_options TEXT[] DEFAULT '{}',
		add_ons JSONB DEFAULT '[]'::jsonb,
		recommendation_reason TEXT,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS users (
		id VARCHAR(64) PRIMARY KEY,
		email VARCHAR(255) UNIQUE NOT NULL,
		password VARCHAR(255) NOT NULL,
		name VARCHAR(255) NOT NULL,
		role VARCHAR(32) NOT NULL DEFAULT 'customer',
		cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE SET NULL,
		google_id VARCHAR(128),
		created_at TIMESTAMPTZ DEFAULT NOW(),
		last_login_at TIMESTAMPTZ,
		login_count INT DEFAULT 1
	);

	CREATE TABLE IF NOT EXISTS orders (
		id VARCHAR(64) PRIMARY KEY,
		cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE CASCADE,
		device_id VARCHAR(128) NOT NULL,
		table_id VARCHAR(32) NOT NULL,
		items JSONB NOT NULL DEFAULT '[]'::jsonb,
		subtotal INT NOT NULL,
		gst INT NOT NULL,
		loyalty_discount INT DEFAULT 0,
		total INT NOT NULL,
		payment_method VARCHAR(32) DEFAULT 'upi',
		payment_status VARCHAR(32) DEFAULT 'paid',
		kitchen_status VARCHAR(32) DEFAULT 'confirmed',
		points_earned INT DEFAULT 0,
		confirmation_code VARCHAR(16) NOT NULL,
		is_returning BOOLEAN DEFAULT FALSE,
		status_timestamps JSONB NOT NULL DEFAULT '{}'::jsonb,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		razorpay_order_id VARCHAR(128)
	);

	CREATE TABLE IF NOT EXISTS complaints (
		complaint_id VARCHAR(64) PRIMARY KEY,
		order_id VARCHAR(64) NOT NULL,
		cafe_id VARCHAR(64) REFERENCES cafes(cafe_id) ON DELETE CASCADE,
		table_id VARCHAR(32),
		issue_type VARCHAR(64) NOT NULL,
		item_name VARCHAR(255),
		description TEXT NOT NULL,
		status VARCHAR(32) DEFAULT 'open',
		created_at TIMESTAMPTZ DEFAULT NOW(),
		resolved_at TIMESTAMPTZ,
		resolved_by VARCHAR(255)
	);
	`
	if _, err := p.pool.Exec(ctx, ddl); err != nil {
		return err
	}

	// If empty, auto-seed
	var count int
	_ = p.pool.QueryRow(ctx, "SELECT COUNT(*) FROM cafes").Scan(&count)
	if count == 0 {
		for _, c := range getSeedCafes() {
			p.CreateCafe(c)
		}
		for _, m := range getSeedMenuItems() {
			p.CreateMenuItem(m)
		}
		for _, u := range getSeedUsers() {
			p.CreateUser(u)
		}
	}
	return nil
}

func (p *PostgresStore) GetCafes() []models.Cafe {
	ctx := context.Background()
	rows, err := p.pool.Query(ctx, `
		SELECT cafe_id, name, tagline, venue_type, icon, location, phone, default_table_id, specialty_item_ids, theme, created_at
		FROM cafes ORDER BY name ASC
	`)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var cafes []models.Cafe
	for rows.Next() {
		var c models.Cafe
		var themeJSON []byte
		var specialty []string
		var tagline, venueType, icon *string

		if err := rows.Scan(
			&c.CafeId, &c.Name, &tagline, &venueType, &icon,
			&c.Location, &c.Phone, &c.DefaultTableId, &specialty, &themeJSON, &c.CreatedAt,
		); err == nil {
			if tagline != nil { c.Tagline = *tagline }
			if venueType != nil { c.VenueType = *venueType }
			if icon != nil { c.Icon = *icon }
			c.SpecialtyItemIds = specialty
			if len(themeJSON) > 0 {
				var theme models.CafeTheme
				if json.Unmarshal(themeJSON, &theme) == nil {
					c.Theme = &theme
				}
			}
			cafes = append(cafes, c)
		}
	}
	return cafes
}

func (p *PostgresStore) GetCafeById(cafeId string) (*models.Cafe, bool) {
	ctx := context.Background()
	var c models.Cafe
	var themeJSON []byte
	var specialty []string
	var tagline, venueType, icon *string

	err := p.pool.QueryRow(ctx, `
		SELECT cafe_id, name, tagline, venue_type, icon, location, phone, default_table_id, specialty_item_ids, theme, created_at
		FROM cafes WHERE cafe_id = $1
	`, cafeId).Scan(
		&c.CafeId, &c.Name, &tagline, &venueType, &icon,
		&c.Location, &c.Phone, &c.DefaultTableId, &specialty, &themeJSON, &c.CreatedAt,
	)
	if err != nil {
		return nil, false
	}

	if tagline != nil { c.Tagline = *tagline }
	if venueType != nil { c.VenueType = *venueType }
	if icon != nil { c.Icon = *icon }
	c.SpecialtyItemIds = specialty
	if len(themeJSON) > 0 {
		var theme models.CafeTheme
		if json.Unmarshal(themeJSON, &theme) == nil {
			c.Theme = &theme
		}
	}
	return &c, true
}

func (p *PostgresStore) CreateCafe(cafe models.Cafe) models.Cafe {
	ctx := context.Background()
	if cafe.CafeId == "" {
		cafe.CafeId = "cafe-" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	cafe.CreatedAt = now

	themeJSON, _ := json.Marshal(cafe.Theme)

	_, _ = p.pool.Exec(ctx, `
		INSERT INTO cafes (cafe_id, name, tagline, venue_type, icon, location, phone, default_table_id, specialty_item_ids, theme, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, cafe.CafeId, cafe.Name, cafe.Tagline, cafe.VenueType, cafe.Icon, cafe.Location, cafe.Phone, cafe.DefaultTableId, cafe.SpecialtyItemIds, themeJSON, now)

	return cafe
}

func (p *PostgresStore) GetMenuItems(cafeId string) []models.MenuItem {
	ctx := context.Background()
	var query string
	var args []interface{}

	if cafeId != "" {
		query = `SELECT item_id, cafe_id, name, price, category, available, tags, image, description, sizes, milk_options, add_ons, recommendation_reason, created_at FROM menu_items WHERE cafe_id = $1 ORDER BY price ASC`
		args = append(args, cafeId)
	} else {
		query = `SELECT item_id, cafe_id, name, price, category, available, tags, image, description, sizes, milk_options, add_ons, recommendation_reason, created_at FROM menu_items ORDER BY price ASC`
	}

	rows, err := p.pool.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var items []models.MenuItem
	for rows.Next() {
		var m models.MenuItem
		var sizesJSON, addOnsJSON []byte
		var tags, milkOptions []string
		var image, desc, recReason *string

		if err := rows.Scan(
			&m.ItemId, &m.CafeId, &m.Name, &m.Price, &m.Category, &m.Available,
			&tags, &image, &desc, &sizesJSON, &milkOptions, &addOnsJSON, &recReason, &m.CreatedAt,
		); err == nil {
			m.Tags = tags
			m.MilkOptions = milkOptions
			if image != nil { m.Image = *image }
			if desc != nil { m.Description = *desc }
			if recReason != nil { m.RecommendationReason = *recReason }
			if len(sizesJSON) > 0 { _ = json.Unmarshal(sizesJSON, &m.Sizes) }
			if len(addOnsJSON) > 0 { _ = json.Unmarshal(addOnsJSON, &m.AddOns) }
			items = append(items, m)
		}
	}
	return items
}

func (p *PostgresStore) GetMenuItemById(itemId string) (*models.MenuItem, bool) {
	ctx := context.Background()
	var m models.MenuItem
	var sizesJSON, addOnsJSON []byte
	var tags, milkOptions []string
	var image, desc, recReason *string

	err := p.pool.QueryRow(ctx, `
		SELECT item_id, cafe_id, name, price, category, available, tags, image, description, sizes, milk_options, add_ons, recommendation_reason, created_at
		FROM menu_items WHERE item_id = $1
	`, itemId).Scan(
		&m.ItemId, &m.CafeId, &m.Name, &m.Price, &m.Category, &m.Available,
		&tags, &image, &desc, &sizesJSON, &milkOptions, &addOnsJSON, &recReason, &m.CreatedAt,
	)
	if err != nil {
		return nil, false
	}

	m.Tags = tags
	m.MilkOptions = milkOptions
	if image != nil { m.Image = *image }
	if desc != nil { m.Description = *desc }
	if recReason != nil { m.RecommendationReason = *recReason }
	if len(sizesJSON) > 0 { _ = json.Unmarshal(sizesJSON, &m.Sizes) }
	if len(addOnsJSON) > 0 { _ = json.Unmarshal(addOnsJSON, &m.AddOns) }

	return &m, true
}

func (p *PostgresStore) CreateMenuItem(item models.MenuItem) models.MenuItem {
	ctx := context.Background()
	if item.ItemId == "" {
		item.ItemId = "item-" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	item.CreatedAt = now
	item.Available = true

	sizesJSON, _ := json.Marshal(item.Sizes)
	addOnsJSON, _ := json.Marshal(item.AddOns)

	_, _ = p.pool.Exec(ctx, `
		INSERT INTO menu_items (item_id, cafe_id, name, price, category, available, tags, image, description, sizes, milk_options, add_ons, recommendation_reason, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`, item.ItemId, item.CafeId, item.Name, item.Price, item.Category, item.Available, item.Tags, item.Image, item.Description, sizesJSON, item.MilkOptions, addOnsJSON, item.RecommendationReason, now)

	return item
}

func (p *PostgresStore) ToggleMenuItem(itemId string) (*models.MenuItem, bool) {
	ctx := context.Background()
	_, err := p.pool.Exec(ctx, `UPDATE menu_items SET available = NOT available WHERE item_id = $1`, itemId)
	if err != nil {
		return nil, false
	}
	return p.GetMenuItemById(itemId)
}

func (p *PostgresStore) GetOrders(cafeId string) []models.Order {
	ctx := context.Background()
	var query string
	var args []interface{}

	if cafeId != "" {
		query = `SELECT id, cafe_id, device_id, table_id, items, subtotal, gst, loyalty_discount, total, payment_method, payment_status, kitchen_status, points_earned, confirmation_code, is_returning, status_timestamps, created_at FROM orders WHERE cafe_id = $1 ORDER BY created_at DESC`
		args = append(args, cafeId)
	} else {
		query = `SELECT id, cafe_id, device_id, table_id, items, subtotal, gst, loyalty_discount, total, payment_method, payment_status, kitchen_status, points_earned, confirmation_code, is_returning, status_timestamps, created_at FROM orders ORDER BY created_at DESC`
	}

	rows, err := p.pool.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var orders []models.Order
	for rows.Next() {
		var o models.Order
		var itemsJSON, timestampsJSON []byte

		if err := rows.Scan(
			&o.Id, &o.CafeId, &o.DeviceId, &o.TableId, &itemsJSON, &o.Subtotal, &o.GST,
			&o.LoyaltyDiscount, &o.Total, &o.PaymentMethod, &o.PaymentStatus, &o.KitchenStatus,
			&o.PointsEarned, &o.ConfirmationCode, &o.IsReturningAtOrderTime, &timestampsJSON, &o.CreatedAt,
		); err == nil {
			_ = json.Unmarshal(itemsJSON, &o.Items)
			_ = json.Unmarshal(timestampsJSON, &o.StatusTimestamps)
			orders = append(orders, o)
		}
	}
	return orders
}

func (p *PostgresStore) GetOrderById(orderId string) (*models.Order, bool) {
	ctx := context.Background()
	var o models.Order
	var itemsJSON, timestampsJSON []byte

	err := p.pool.QueryRow(ctx, `
		SELECT id, cafe_id, device_id, table_id, items, subtotal, gst, loyalty_discount, total, payment_method, payment_status, kitchen_status, points_earned, confirmation_code, is_returning, status_timestamps, created_at
		FROM orders WHERE id = $1
	`, orderId).Scan(
		&o.Id, &o.CafeId, &o.DeviceId, &o.TableId, &itemsJSON, &o.Subtotal, &o.GST,
		&o.LoyaltyDiscount, &o.Total, &o.PaymentMethod, &o.PaymentStatus, &o.KitchenStatus,
		&o.PointsEarned, &o.ConfirmationCode, &o.IsReturningAtOrderTime, &timestampsJSON, &o.CreatedAt,
	)
	if err != nil {
		return nil, false
	}

	_ = json.Unmarshal(itemsJSON, &o.Items)
	_ = json.Unmarshal(timestampsJSON, &o.StatusTimestamps)
	return &o, true
}

func (p *PostgresStore) CreateOrder(order models.Order) models.Order {
	ctx := context.Background()
	now := time.Now().UTC().Format(time.RFC3339)
	order.CreatedAt = now
	order.StatusTimestamps.Created = now

	itemsJSON, _ := json.Marshal(order.Items)
	timestampsJSON, _ := json.Marshal(order.StatusTimestamps)

	_, _ = p.pool.Exec(ctx, `
		INSERT INTO orders (id, cafe_id, device_id, table_id, items, subtotal, gst, loyalty_discount, total, payment_method, payment_status, kitchen_status, points_earned, confirmation_code, is_returning, status_timestamps, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
	`, order.Id, order.CafeId, order.DeviceId, order.TableId, itemsJSON, order.Subtotal, order.GST, order.LoyaltyDiscount, order.Total, order.PaymentMethod, order.PaymentStatus, order.KitchenStatus, order.PointsEarned, order.ConfirmationCode, order.IsReturningAtOrderTime, timestampsJSON, now)

	return order
}

func (p *PostgresStore) UpdateOrderStatus(orderId string, status string) (*models.Order, bool) {
	ctx := context.Background()
	now := time.Now().UTC().Format(time.RFC3339)

	_, err := p.pool.Exec(ctx, `
		UPDATE orders SET kitchen_status = $1, updated_at = $2 WHERE id = $3
	`, status, now, orderId)
	if err != nil {
		return nil, false
	}
	return p.GetOrderById(orderId)
}

func (p *PostgresStore) GetUserByEmail(email string) (*models.User, bool) {
	ctx := context.Background()
	var u models.User
	var cafeId *string

	err := p.pool.QueryRow(ctx, `
		SELECT id, email, password, name, role, cafe_id, created_at, login_count
		FROM users WHERE email = $1
	`, email).Scan(&u.Id, &u.Email, &u.Password, &u.Name, &u.Role, &cafeId, &u.CreatedAt, &u.LoginCount)
	if err != nil {
		return nil, false
	}
	u.CafeId = cafeId
	return &u, true
}

func (p *PostgresStore) GetUserById(id string) (*models.User, bool) {
	ctx := context.Background()
	var u models.User
	var cafeId *string

	err := p.pool.QueryRow(ctx, `
		SELECT id, email, password, name, role, cafe_id, created_at, login_count
		FROM users WHERE id = $1
	`, id).Scan(&u.Id, &u.Email, &u.Password, &u.Name, &u.Role, &cafeId, &u.CreatedAt, &u.LoginCount)
	if err != nil {
		return nil, false
	}
	u.CafeId = cafeId
	return &u, true
}

func (p *PostgresStore) CreateUser(user models.User) models.User {
	ctx := context.Background()
	if user.Id == "" {
		user.Id = "user-" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	user.CreatedAt = now

	_, _ = p.pool.Exec(ctx, `
		INSERT INTO users (id, email, password, name, role, cafe_id, created_at, login_count)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, user.Id, user.Email, user.Password, user.Name, user.Role, user.CafeId, now, 1)

	return user
}

func (p *PostgresStore) CreateSession(session models.Session) models.Session {
	return session
}

func (p *PostgresStore) GetDevice(deviceId, cafeId string) (*models.Device, bool) {
	return nil, false
}

func (p *PostgresStore) UpsertDevice(device models.Device) models.Device {
	return device
}

func (p *PostgresStore) CreateComplaint(complaint models.Complaint) models.Complaint {
	ctx := context.Background()
	if complaint.ComplaintId == "" {
		complaint.ComplaintId = "comp-" + uuid.New().String()[:8]
	}
	now := time.Now().UTC().Format(time.RFC3339)
	complaint.CreatedAt = now
	complaint.Status = "open"

	_, _ = p.pool.Exec(ctx, `
		INSERT INTO complaints (complaint_id, order_id, cafe_id, table_id, issue_type, item_name, description, status, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, complaint.ComplaintId, complaint.OrderId, complaint.CafeId, complaint.TableId, complaint.IssueType, complaint.ItemName, complaint.Description, complaint.Status, now)

	return complaint
}

func (p *PostgresStore) GetComplaints(cafeId string) []models.Complaint {
	ctx := context.Background()
	var query string
	var args []interface{}
	if cafeId != "" {
		query = `SELECT complaint_id, order_id, cafe_id, table_id, issue_type, item_name, description, status, created_at, resolved_at, resolved_by FROM complaints WHERE cafe_id = $1 ORDER BY created_at DESC`
		args = append(args, cafeId)
	} else {
		query = `SELECT complaint_id, order_id, cafe_id, table_id, issue_type, item_name, description, status, created_at, resolved_at, resolved_by FROM complaints ORDER BY created_at DESC`
	}

	rows, err := p.pool.Query(ctx, query, args...)
	if err != nil {
		return nil
	}
	defer rows.Close()

	var complaints []models.Complaint
	for rows.Next() {
		var c models.Complaint
		var tableId, itemName, resolvedAt, resolvedBy *string
		if err := rows.Scan(&c.ComplaintId, &c.OrderId, &c.CafeId, &tableId, &c.IssueType, &itemName, &c.Description, &c.Status, &c.CreatedAt, &resolvedAt, &resolvedBy); err == nil {
			if tableId != nil { c.TableId = *tableId }
			if itemName != nil { c.ItemName = *itemName }
			c.ResolvedAt = resolvedAt
			c.ResolvedBy = resolvedBy
			complaints = append(complaints, c)
		}
	}
	return complaints
}

func (p *PostgresStore) ResolveComplaint(complaintId, resolvedBy string) (*models.Complaint, bool) {
	ctx := context.Background()
	now := time.Now().UTC().Format(time.RFC3339)
	_, err := p.pool.Exec(ctx, `
		UPDATE complaints SET status = 'resolved', resolved_at = $1, resolved_by = $2 WHERE complaint_id = $3
	`, now, resolvedBy, complaintId)
	if err != nil {
		return nil, false
	}
	var c models.Complaint
	return &c, true
}
