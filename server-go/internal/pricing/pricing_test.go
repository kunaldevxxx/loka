package pricing

import (
	"testing"

	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

func TestParseMilkPrice(t *testing.T) {
	tests := []struct {
		input    string
		expected int
	}{
		{"Whole Milk", 0},
		{"Oat Milk (+₹40)", 40},
		{"Almond Milk (+₹35)", 35},
		{"Soy Milk (+Rs.30)", 30},
		{"", 0},
	}

	for _, tt := range tests {
		got := ParseMilkPrice(tt.input)
		if got != tt.expected {
			t.Errorf("ParseMilkPrice(%q) = %d; want %d", tt.input, got, tt.expected)
		}
	}
}

func TestCalculatePricing(t *testing.T) {
	menuMap := map[string]models.MenuItem{
		"item-001": {
			ItemId: "item-001",
			Name:   "Cappuccino",
			Price:  200,
			Sizes: []models.MenuItemSize{
				{Label: "Large", Extra: 40},
			},
			AddOns: []models.MenuItemAddOn{
				{Label: "Extra Shot", Price: 50},
			},
		},
	}

	size := "Large"
	milk := "Oat Milk (+₹40)"
	req := []models.CreateOrderItemRequest{
		{
			ItemId: "item-001",
			Qty:    2,
			Customization: &models.ItemCustomization{
				Size:   &size,
				Milk:   &milk,
				AddOns: []string{"Extra Shot"},
			},
		},
	}

	// unitPrice = 200 (base) + 40 (large) + 40 (oat) + 50 (extra shot) = 330
	// subtotal = 330 * 2 = 660
	// gst = round(660 * 0.05) = 33
	// discount (returning=false) = 0
	// total = 660 + 33 = 693
	items, subtotal, gst, disc, total, err := CalculatePricing(req, menuMap, false)
	if err != nil {
		t.Fatalf("CalculatePricing failed: %v", err)
	}

	if subtotal != 660 {
		t.Errorf("expected subtotal 660, got %d", subtotal)
	}
	if gst != 33 {
		t.Errorf("expected gst 33, got %d", gst)
	}
	if disc != 0 {
		t.Errorf("expected discount 0, got %d", disc)
	}
	if total != 693 {
		t.Errorf("expected total 693, got %d", total)
	}
	if len(items) != 1 || items[0].LineTotal != 660 {
		t.Errorf("item line total mismatch, got %v", items)
	}

	// Test with loyalty returning customer
	_, _, _, discRet, totalRet, _ := CalculatePricing(req, menuMap, true)
	if discRet != 33 {
		t.Errorf("expected returning discount 33, got %d", discRet)
	}
	if totalRet != 660 {
		t.Errorf("expected returning total 660, got %d", totalRet)
	}
}
