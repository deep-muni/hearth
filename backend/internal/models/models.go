package models

import "time"

type SalaryType string

const (
	SalaryTypeFixedMonthly SalaryType = "FIXED_MONTHLY"
	SalaryTypeDailyWage    SalaryType = "DAILY_WAGE"
	SalaryTypeStrictFlat   SalaryType = "STRICT_FLAT"
)

type AttendanceStatus string

const (
	StatusPresent  AttendanceStatus = "PRESENT"
	StatusFullLeave AttendanceStatus = "FULL_LEAVE"
	StatusHalfLeave AttendanceStatus = "HALF_LEAVE"
	StatusPaidLeave AttendanceStatus = "PAID_LEAVE"
)

type HouseHelp struct {
	ID                 string     `json:"id"`
	Name               string     `json:"name"`
	Role               string     `json:"role"`
	AvatarEmoji        string     `json:"avatarEmoji"`
	ColorTheme         string     `json:"colorTheme"`
	SalaryType         SalaryType `json:"salaryType"`
	BaseAmount         float64    `json:"baseAmount"`
	PaidLeavesPerMonth int        `json:"paidLeavesPerMonth"`
	WeeklyOffDay       int        `json:"weeklyOffDay"` // 0 = Sunday, 1 = Monday...
	Phone              string     `json:"phone,omitempty"`
	Notes              string     `json:"notes,omitempty"`
	CreatedAt          time.Time  `json:"createdAt"`
}

type AttendanceRecord struct {
	ID          string           `json:"id"`
	HelperID    string           `json:"helperId"`
	Date        string           `json:"date"` // YYYY-MM-DD
	Status      AttendanceStatus `json:"status"`
	Note        string           `json:"note,omitempty"`
	UpdatedAt   time.Time        `json:"updatedAt"`
}

type MonthlySalarySummary struct {
	HelperID       string  `json:"helperId"`
	Month          string  `json:"month"` // YYYY-MM
	WorkingDays    int     `json:"workingDays"`
	DaysPresent    float64 `json:"daysPresent"`
	UnpaidLeaves   float64 `json:"unpaidLeaves"`
	PaidLeaves     float64 `json:"paidLeaves"`
	BaseSalary     float64 `json:"baseSalary"`
	Deduction      float64 `json:"deduction"`
	Bonus          float64 `json:"bonus"`
	AdvancePaid    float64 `json:"advancePaid"`
	NetPayable     float64 `json:"netPayable"`
	IsPaid         bool    `json:"isPaid"`
}
