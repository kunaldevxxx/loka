package models

// CafeTheme defines the branding colors and fonts for each venue
type CafeTheme struct {
	Background        string  `json:"background" db:"background"`
	Foreground        string  `json:"foreground" db:"foreground"`
	Card              string  `json:"card" db:"card"`
	CardForeground    string  `json:"cardForeground" db:"card_foreground"`
	Primary           string  `json:"primary" db:"primary"`
	PrimaryForeground string  `json:"primaryForeground" db:"primary_foreground"`
	Secondary         string  `json:"secondary" db:"secondary"`
	SecondaryForeground string `json:"secondaryForeground" db:"secondary_foreground"`
	Muted             string  `json:"muted" db:"muted"`
	MutedForeground   string  `json:"mutedForeground" db:"muted_foreground"`
	Accent            string  `json:"accent" db:"accent"`
	AccentForeground  string  `json:"accentForeground" db:"accent_foreground"`
	Border            string  `json:"border" db:"border"`
	FontDisplay       *string `json:"fontDisplay,omitempty" db:"font_display"`
	FontSans          *string `json:"fontSans,omitempty" db:"font_sans"`
}

// Cafe represents a cafe venue in the network
type Cafe struct {
	CafeId           string     `json:"cafeId" db:"cafe_id"`
	Name             string     `json:"name" db:"name"`
	Tagline          string     `json:"tagline,omitempty" db:"tagline"`
	VenueType        string     `json:"venueType,omitempty" db:"venue_type"`
	Icon             string     `json:"icon,omitempty" db:"icon"`
	Location         string     `json:"location" db:"location"`
	Phone            string     `json:"phone" db:"phone"`
	DefaultTableId   string     `json:"defaultTableId" db:"default_table_id"`
	SpecialtyItemIds []string   `json:"specialtyItemIds,omitempty" db:"specialty_item_ids"`
	Theme            *CafeTheme `json:"theme,omitempty" db:"theme"`
	CreatedAt        string     `json:"createdAt,omitempty" db:"created_at"`
	UpdatedAt        string     `json:"updatedAt,omitempty" db:"updated_at"`
}

// MenuItemSize represents size variants (Small, Regular, Large)
type MenuItemSize struct {
	Label string `json:"label"`
	Extra int    `json:"extra"`
}

// MenuItemAddOn represents syrups, extra shots, etc.
type MenuItemAddOn struct {
	Label string `json:"label"`
	Price int    `json:"price"`
}

// MenuItem represents a dish or beverage on the menu
type MenuItem struct {
	ItemId               string          `json:"itemId" db:"item_id"`
	CafeId               string          `json:"cafeId" db:"cafe_id"`
	Name                 string          `json:"name" db:"name"`
	Price                int             `json:"price" db:"price"`
	Category             string          `json:"category" db:"category"`
	Available            bool            `json:"available" db:"available"`
	Tags                 []string        `json:"tags,omitempty" db:"tags"`
	Image                string          `json:"image,omitempty" db:"image"`
	Description          string          `json:"description,omitempty" db:"description"`
	Sizes                []MenuItemSize  `json:"sizes,omitempty" db:"sizes"`
	MilkOptions          []string        `json:"milkOptions,omitempty" db:"milk_options"`
	AddOns               []MenuItemAddOn `json:"addOns,omitempty" db:"add_ons"`
	RecommendationReason string          `json:"recommendationReason,omitempty" db:"recommendation_reason"`
	CreatedAt            string          `json:"createdAt,omitempty" db:"created_at"`
	UpdatedAt            string          `json:"updatedAt,omitempty" db:"updated_at"`
}

// ItemCustomization represents user selections for milk, size, and extras
type ItemCustomization struct {
	Size   *string  `json:"size,omitempty"`
	Milk   *string  `json:"milk,omitempty"`
	AddOns []string `json:"addOns,omitempty"`
}

// OrderItemSnapshot is an immutable snapshot of an item ordered
type OrderItemSnapshot struct {
	ItemId               string             `json:"itemId"`
	Name                 string             `json:"name"`
	Qty                  int                `json:"qty"`
	UnitPrice            int                `json:"unitPrice"`
	LineTotal            int                `json:"lineTotal"`
	Customization        *ItemCustomization `json:"customization,omitempty"`
	CustomizationSummary string             `json:"customizationSummary,omitempty"`
}

type OrderStatusTimestamps struct {
	Created   string  `json:"created"`
	Confirmed *string `json:"confirmed,omitempty"`
	Preparing *string `json:"preparing,omitempty"`
	Ready     *string `json:"ready,omitempty"`
	Collected *string `json:"collected,omitempty"`
	Cancelled *string `json:"cancelled,omitempty"`
}

// Order represents a customer table order
type Order struct {
	Id                     string                `json:"id" db:"id"`
	CafeId                 string                `json:"cafeId" db:"cafe_id"`
	DeviceId               string                `json:"deviceId" db:"device_id"`
	TableId                string                `json:"tableId" db:"table_id"`
	Items                  []OrderItemSnapshot   `json:"items" db:"items"`
	Subtotal               int                   `json:"subtotal" db:"subtotal"`
	GST                    int                   `json:"gst" db:"gst"`
	LoyaltyDiscount        int                   `json:"loyaltyDiscount" db:"loyalty_discount"`
	Total                  int                   `json:"total" db:"total"`
	PaymentMethod          string                `json:"paymentMethod" db:"payment_method"`
	PaymentStatus          string                `json:"paymentStatus" db:"payment_status"`
	KitchenStatus          string                `json:"kitchenStatus" db:"kitchen_status"`
	PointsEarned           int                   `json:"pointsEarned" db:"points_earned"`
	ConfirmationCode       string                `json:"confirmationCode" db:"confirmation_code"`
	IsReturningAtOrderTime bool                  `json:"isReturningAtOrderTime" db:"is_returning"`
	StatusTimestamps       OrderStatusTimestamps `json:"statusTimestamps" db:"status_timestamps"`
	ConfirmedAt            *string               `json:"confirmedAt,omitempty" db:"confirmed_at"`
	CreatedAt              string                `json:"createdAt" db:"created_at"`
	UpdatedAt              string                `json:"updatedAt,omitempty" db:"updated_at"`
	RazorpayOrderId        *string               `json:"razorpayOrderId,omitempty" db:"razorpay_order_id"`
}

// User represents customers, managers, chefs, and global support
type User struct {
	Id         string  `json:"id" db:"id"`
	Email      string  `json:"email" db:"email"`
	Password   string  `json:"-" db:"password"`
	Name       string  `json:"name" db:"name"`
	Role       string  `json:"role" db:"role"`
	CafeId     *string `json:"cafeId" db:"cafe_id"`
	GoogleId   *string `json:"googleId,omitempty" db:"google_id"`
	CreatedAt  string  `json:"createdAt" db:"created_at"`
	LastLoginAt *string `json:"lastLoginAt,omitempty" db:"last_login_at"`
	LoginCount int     `json:"loginCount" db:"login_count"`
}

// Session represents a table session token
type Session struct {
	SessionToken string `json:"sessionToken" db:"session_token"`
	CafeId       string `json:"cafeId" db:"cafe_id"`
	TableId      string `json:"tableId" db:"table_id"`
	DeviceId     string `json:"deviceId" db:"device_id"`
	CreatedAt    string `json:"createdAt" db:"created_at"`
	ExpiresAt    string `json:"expiresAt" db:"expires_at"`
}

// Device tracks returning visitor status
type Device struct {
	DeviceId  string `json:"deviceId" db:"device_id"`
	CafeId    string `json:"cafeId" db:"cafe_id"`
	Granted   bool   `json:"granted" db:"granted"`
	UpdatedAt string `json:"updatedAt" db:"updated_at"`
	CreatedAt string `json:"createdAt,omitempty" db:"created_at"`
}

// Complaint represents customer issue tickets
type Complaint struct {
	ComplaintId string  `json:"complaintId" db:"complaint_id"`
	OrderId     string  `json:"orderId" db:"order_id"`
	CafeId      string  `json:"cafeId" db:"cafe_id"`
	TableId     string  `json:"tableId,omitempty" db:"table_id"`
	IssueType   string  `json:"issueType" db:"issue_type"`
	ItemName    string  `json:"itemName,omitempty" db:"item_name"`
	Description string  `json:"description" db:"description"`
	Status      string  `json:"status" db:"status"`
	CreatedAt   string  `json:"createdAt" db:"created_at"`
	ResolvedAt  *string `json:"resolvedAt,omitempty" db:"resolved_at"`
	ResolvedBy  *string `json:"resolvedBy,omitempty" db:"resolved_by"`
}

// QRCode holds dynamic QR SVG data for tables
type QRCode struct {
	CodeId         string `json:"codeId" db:"code_id"`
	CafeId         string `json:"cafeId" db:"cafe_id"`
	TableId        string `json:"tableId,omitempty" db:"table_id"`
	DestinationUrl string `json:"destinationUrl" db:"destination_url"`
	SvgPayload     string `json:"svgPayload" db:"svg_payload"`
	Version        int    `json:"version" db:"version"`
	Active         bool   `json:"active" db:"active"`
	MenuChecksum   string `json:"menuChecksum" db:"menu_checksum"`
	CreatedAt      string `json:"createdAt" db:"created_at"`
	UpdatedAt      string `json:"updatedAt,omitempty" db:"updated_at"`
}

// DTOs
type CreateOrderItemRequest struct {
	ItemId        string             `json:"itemId"`
	Qty           int                `json:"qty"`
	Customization *ItemCustomization `json:"customization,omitempty"`
}

type CreateOrderRequest struct {
	CafeId        string                   `json:"cafeId"`
	DeviceId      string                   `json:"deviceId"`
	TableId       string                   `json:"tableId"`
	Items         []CreateOrderItemRequest `json:"items"`
	PaymentMethod string                   `json:"paymentMethod"`
}

type AuthRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name,omitempty"`
	Role     string `json:"role,omitempty"`
	CafeId   string `json:"cafeId,omitempty"`
}

type AuthResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}
