package validators

type PaginationQuery struct {
	Page  int `query:"page"`
	Limit int `query:"limit"`
}
