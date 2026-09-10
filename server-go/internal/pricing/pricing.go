package pricing

import (
	"errors"
	"fmt"
	"math"
	"regexp"
	"strconv"
	"strings"

	"github.com/kunaldevxxx/loka-backend-go/internal/models"
)

var milkRegex = regexp.MustCompile(`\(\+[₹Rs.]*\s*(\d+)\)`)

// ParseMilkPrice parses extra price from a milk label e.g. "(+₹40)", "(+Rs.30)"
func ParseMilkPrice(milkLabel string) int {
	if milkLabel == "" {
		return 0
	}
	matches := milkRegex.FindStringSubmatch(milkLabel)
	if len(matches) >= 2 {
		val, err := strconv.Atoi(matches[1])
		if err == nil {
			return val
		}
	}
	return 0
}

// CalculatePricing performs authoritative pricing breakdown according to Loka Cafe rules
func CalculatePricing(
	requestedItems []models.CreateOrderItemRequest,
	menuMap map[string]models.MenuItem,
	isReturning bool,
) ([]models.OrderItemSnapshot, int, int, int, int, error) {
	if len(requestedItems) == 0 {
		return nil, 0, 0, 0, 0, errors.New("order items cannot be empty")
	}

	subtotal := 0
	processedItems := make([]models.OrderItemSnapshot, 0, len(requestedItems))

	for _, reqItem := range requestedItems {
		if reqItem.ItemId == "" {
			return nil, 0, 0, 0, 0, errors.New("missing itemId in order item")
		}

		menuItem, exists := menuMap[reqItem.ItemId]
		if !exists {
			return nil, 0, 0, 0, 0, fmt.Errorf("unknown menu item: %s", reqItem.ItemId)
		}

		qty := reqItem.Qty
		if qty < 1 {
			qty = 1
		}

		unitPrice := menuItem.Price
		summaryParts := make([]string, 0)

		if reqItem.Customization != nil {
			// Size extra
			if reqItem.Customization.Size != nil && *reqItem.Customization.Size != "" {
				sizeLabel := *reqItem.Customization.Size
				for _, s := range menuItem.Sizes {
					if s.Label == sizeLabel {
						unitPrice += s.Extra
						summaryParts = append(summaryParts, sizeLabel)
						break
					}
				}
			}

			// Milk extra
			if reqItem.Customization.Milk != nil && *reqItem.Customization.Milk != "" {
				milkLabel := *reqItem.Customization.Milk
				unitPrice += ParseMilkPrice(milkLabel)
				cleanMilk := milkRegex.ReplaceAllString(milkLabel, "")
				summaryParts = append(summaryParts, strings.TrimSpace(cleanMilk))
			}

			// Add-ons
			if len(reqItem.Customization.AddOns) > 0 {
				for _, addOnLabel := range reqItem.Customization.AddOns {
					for _, a := range menuItem.AddOns {
						if a.Label == addOnLabel {
							unitPrice += a.Price
							summaryParts = append(summaryParts, "+"+a.Label)
							break
						}
					}
				}
			}
		}

		lineTotal := unitPrice * qty
		subtotal += lineTotal

		processedItems = append(processedItems, models.OrderItemSnapshot{
			ItemId:               menuItem.ItemId,
			Name:                 menuItem.Name,
			Qty:                  qty,
			UnitPrice:            unitPrice,
			LineTotal:            lineTotal,
			Customization:        reqItem.Customization,
			CustomizationSummary: strings.Join(summaryParts, ", "),
		})
	}

	gst := int(math.Round(float64(subtotal) * 0.05))
	loyaltyDiscount := 0
	if isReturning {
		loyaltyDiscount = int(math.Round(float64(subtotal) * 0.05))
	}

	total := subtotal + gst - loyaltyDiscount

	return processedItems, subtotal, gst, loyaltyDiscount, total, nil
}
