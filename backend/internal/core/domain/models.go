package domain

type SalaryType string

const (
	SalaryTypeDaysLeaves   SalaryType = "DAYS_LEAVES"
	SalaryTypeFixed        SalaryType = "FIXED"
	SalaryTypeCountBased   SalaryType = "COUNT_BASED"
	SalaryTypeFixedMonthly SalaryType = "FIXED_MONTHLY"
	SalaryTypeDailyWage    SalaryType = "DAILY_WAGE"
	SalaryTypeStrictFlat   SalaryType = "STRICT_FLAT"
)

type AttendanceStatus string

const (
	StatusPresent   AttendanceStatus = "PRESENT"
	StatusFullLeave AttendanceStatus = "FULL_LEAVE"
	StatusHalfLeave AttendanceStatus = "HALF_LEAVE"
	StatusPaidLeave AttendanceStatus = "PAID_LEAVE"
	StatusWeeklyOff AttendanceStatus = "WEEKLY_OFF"
)

type HouseHelp struct {
	ID                  string     `json:"id" bson:"id"`
	Name                string     `json:"name" bson:"name"`
	Role                string     `json:"role" bson:"role"`
	AvatarEmoji         string     `json:"avatarEmoji" bson:"avatarEmoji"`
	ColorTheme          string     `json:"colorTheme" bson:"colorTheme"`
	SalaryType          SalaryType `json:"salaryType" bson:"salaryType"`
	BaseSalary          float64    `json:"baseSalary" bson:"baseSalary"`
	RatePerItem         *float64   `json:"ratePerItem,omitempty" bson:"ratePerItem,omitempty"`
	ItemUnitName        string     `json:"itemUnitName,omitempty" bson:"itemUnitName,omitempty"`
	PaidLeavesAllowance int        `json:"paidLeavesAllowance" bson:"paidLeavesAllowance"`
	WeeklyOffDay        int        `json:"weeklyOffDay" bson:"weeklyOffDay"`
	Phone               string     `json:"phone,omitempty" bson:"phone,omitempty"`
	Notes               string     `json:"notes,omitempty" bson:"notes,omitempty"`
	JoinDate            string     `json:"joinDate,omitempty" bson:"joinDate,omitempty"`
	LeftDate            string     `json:"leftDate,omitempty" bson:"leftDate,omitempty"`
	IsActive            bool       `json:"isActive" bson:"isActive"`
	CreatedAt           string     `json:"createdAt,omitempty" bson:"createdAt,omitempty"`
}

type AttendanceRecord struct {
	ID         string            `json:"id" bson:"id"`
	HelperID   string            `json:"helperId" bson:"helperId"`
	Date       string            `json:"date" bson:"date"`
	Status     *AttendanceStatus `json:"status,omitempty" bson:"status,omitempty"`
	ItemCount  *int              `json:"itemCount,omitempty" bson:"itemCount,omitempty"`
	CustomRate *float64          `json:"customRate,omitempty" bson:"customRate,omitempty"`
	Note       string            `json:"note,omitempty" bson:"note,omitempty"`
	UpdatedAt  string            `json:"updatedAt,omitempty" bson:"updatedAt,omitempty"`
}

type MonthlyAdjustment struct {
	HelperID         string  `json:"helperId" bson:"helperId"`
	Month            string  `json:"month" bson:"month"`
	Bonus            float64 `json:"bonus" bson:"bonus"`
	AdvanceDeduction float64 `json:"advanceDeduction" bson:"advanceDeduction"`
	Note             string  `json:"note,omitempty" bson:"note,omitempty"`
	IsPaid           bool    `json:"isPaid" bson:"isPaid"`
	PaidOn           string  `json:"paidOn,omitempty" bson:"paidOn,omitempty"`
	PaymentMethod    string  `json:"paymentMethod,omitempty" bson:"paymentMethod,omitempty"`
}
