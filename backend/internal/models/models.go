package models

import "time"

type SalaryType string

const (
	SalaryTypeDaysLeaves SalaryType = "DAYS_LEAVES"
	SalaryTypeFixed      SalaryType = "FIXED"
	SalaryTypeCountBased SalaryType = "COUNT_BASED"
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
	ID                  string     `json:"id"`
	Name                string     `json:"name"`
	Role                string     `json:"role"`
	AvatarEmoji         string     `json:"avatarEmoji"`
	ColorTheme          string     `json:"colorTheme"`
	SalaryType          SalaryType `json:"salaryType"`
	BaseSalary          float64    `json:"baseSalary"`
	RatePerItem         float64    `json:"ratePerItem,omitempty"`
	ItemUnitName        string     `json:"itemUnitName,omitempty"`
	PaidLeavesAllowance int        `json:"paidLeavesAllowance"`
	WeeklyOffDay        int        `json:"weeklyOffDay"` // 0 = Sunday, 1 = Monday... -1 = None
	Phone               string     `json:"phone,omitempty"`
	Notes               string     `json:"notes,omitempty"`
	CreatedAt           time.Time  `json:"createdAt"`
}

type AttendanceRecord struct {
	ID         string            `json:"id"`
	HelperID   string            `json:"helperId"`
	Date       string            `json:"date"` // YYYY-MM-DD
	Status     *AttendanceStatus `json:"status,omitempty"`
	ItemCount  *int              `json:"itemCount,omitempty"`
	CustomRate *float64          `json:"customRate,omitempty"`
	Note       string            `json:"note,omitempty"`
	UpdatedAt  time.Time         `json:"updatedAt"`
}

type MonthlySalarySummary struct {
	HelperID       string  `json:"helperId"`
	Month          string  `json:"month"` // YYYY-MM
	WorkingDays    int     `json:"workingDays"`
	DaysPresent    float64 `json:"daysPresent"`
	TotalLeaves    float64 `json:"totalLeaves"`
	TotalItemCount int     `json:"totalItemCount"`
	BaseSalary     float64 `json:"baseSalary"`
	Deduction      float64 `json:"deduction"`
	Bonus          float64 `json:"bonus"`
	AdvancePaid    float64 `json:"advancePaid"`
	NetPayable     float64 `json:"netPayable"`
	IsPaid         bool    `json:"isPaid"`
}
