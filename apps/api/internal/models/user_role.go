package models

type UserRole string

const (
	RoleSuperAdmin UserRole = "super_admin"
	RoleAdmin      UserRole = "admin"
	RoleEditor     UserRole = "editor"
	RoleUser       UserRole = "user"
)

func (r UserRole) IsValid() bool {
	switch r {
	case RoleSuperAdmin,
		RoleAdmin,
		RoleEditor,
		RoleUser:
		return true
	default:
		return false
	}
}
