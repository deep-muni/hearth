package domain

type MealSlotConfig struct {
	ID          string `json:"id" bson:"id"`
	Name        string `json:"name" bson:"name"`
	DefaultTime string `json:"defaultTime,omitempty" bson:"defaultTime,omitempty"`
	IsEnabled   bool   `json:"isEnabled" bson:"isEnabled"`
	Order       int    `json:"order" bson:"order"`
}

type MealSlot struct {
	ID           string   `json:"id" bson:"id"`
	SlotConfigID string   `json:"slotConfigId,omitempty" bson:"slotConfigId,omitempty"`
	Name         string   `json:"name" bson:"name"`
	Items        []string `json:"items" bson:"items"`
	Note         string   `json:"note,omitempty" bson:"note,omitempty"`
	Tags         []string `json:"tags,omitempty" bson:"tags,omitempty"`
	CookStaffID  string   `json:"cookStaffId,omitempty" bson:"cookStaffId,omitempty"`
	IsCompleted  bool     `json:"isCompleted,omitempty" bson:"isCompleted,omitempty"`
}

type DayMenu struct {
	ID        string     `json:"id" bson:"id"`
	Date      string     `json:"date" bson:"date"`
	Slots     []MealSlot `json:"slots" bson:"slots"`
	Note      string     `json:"note,omitempty" bson:"note,omitempty"`
	UpdatedAt string     `json:"updatedAt,omitempty" bson:"updatedAt,omitempty"`
}

type DishSuggestion struct {
	ID              string   `json:"id" bson:"id"`
	Name            string   `json:"name" bson:"name"`
	Category        string   `json:"category" bson:"category"`
	IsVeg           bool     `json:"isVeg" bson:"isVeg"`
	Tags            []string `json:"tags,omitempty" bson:"tags,omitempty"`
	DefaultSlotName string   `json:"defaultSlotName,omitempty" bson:"defaultSlotName,omitempty"`
}

type DayRoutineTemplate struct {
	DayOfWeek int        `json:"dayOfWeek" bson:"dayOfWeek"`
	DayName   string     `json:"dayName" bson:"dayName"`
	Slots     []MealSlot `json:"slots" bson:"slots"`
	Note      string     `json:"note,omitempty" bson:"note,omitempty"`
}

type WeeklyRoutine map[int]DayRoutineTemplate
