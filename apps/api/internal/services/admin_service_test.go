package services

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"gorm.io/gorm"

	"github.com/0xatanda/shef-platform/internal/models"
)

type mockUserRepository struct {
	users []models.User
	user  *models.User
	total int64
	err   error
}

func (m *mockUserRepository) List(
	ctx context.Context,
	page,
	limit int,
) ([]models.User, int64, error) {
	return m.users, m.total, m.err
}

func (m *mockUserRepository) FindByEmail(context.Context, string) (*models.User, error) {
	return nil, nil
}

func (m *mockUserRepository) FindByID(
	ctx context.Context,
	id uuid.UUID,
) (*models.User, error) {
	if m.err != nil {
		return nil, m.err
	}

	return m.user, nil
}

func (m *mockUserRepository) UpdateLastLogin(context.Context, uuid.UUID) error {
	return nil
}

func (m *mockUserRepository) Create(context.Context, *models.User) error {
	return nil
}

func (m *mockUserRepository) Update(context.Context, *models.User) error {
	return nil
}

func (m *mockUserRepository) Delete(context.Context, uuid.UUID) error {
	return nil
}

func (m *mockUserRepository) ChangeStatus(context.Context, uuid.UUID, bool) error {
	return nil
}
func TestListUsers(t *testing.T) {

	repo := &mockUserRepository{
		users: []models.User{
			{
				ID:            uuid.New(),
				FirstName:     "John",
				LastName:      "Doe",
				Email:         "john@test.com",
				Role:          models.RoleSuperAdmin,
				IsActive:      true,
				EmailVerified: true,
			},
		},
		total: 1,
	}

	service := NewAdminService(repo)

	res, err := service.ListUsers(
		context.Background(),
		1,
		10,
	)

	assert.NoError(t, err)
	assert.NotNil(t, res)
	assert.Equal(t, int64(1), res.Total)
	assert.Len(t, res.Items, 1)
	assert.Equal(t, "John", res.Items[0].FirstName)
	assert.Equal(t, "Doe", res.Items[0].LastName)
	assert.Equal(t, "john@test.com", res.Items[0].Email)
}

func TestListUsersEmpty(t *testing.T) {

	repo := &mockUserRepository{
		users: []models.User{},
		total: 0,
	}

	service := NewAdminService(repo)

	res, err := service.ListUsers(
		context.Background(),
		1,
		10,
	)

	assert.NoError(t, err)
	assert.Equal(t, int64(0), res.Total)
	assert.Len(t, res.Items, 0)
}

func TestListUsersRepositoryError(t *testing.T) {

	repo := &mockUserRepository{
		err: assert.AnError,
	}

	service := NewAdminService(repo)

	res, err := service.ListUsers(
		context.Background(),
		1,
		10,
	)

	assert.Error(t, err)
	assert.Nil(t, res)
}
func TestGetUser(t *testing.T) {

	id := uuid.New()

	repo := &mockUserRepository{
		user: &models.User{
			ID:        id,
			FirstName: "John",
			LastName:  "Doe",
			Email:     "john@test.com",
			Role:      models.RoleAdmin,
		},
	}

	service := NewAdminService(repo)

	user, err := service.GetUser(
		context.Background(),
		id,
	)

	assert.NoError(t, err)
	assert.NotNil(t, user)
	assert.Equal(t, "John", user.FirstName)
	assert.Equal(t, "john@test.com", user.Email)
}

func TestGetUserNotFound(t *testing.T) {

	repo := &mockUserRepository{
		err: gorm.ErrRecordNotFound,
	}

	service := NewAdminService(repo)

	user, err := service.GetUser(
		context.Background(),
		uuid.New(),
	)

	assert.Error(t, err)
	assert.Nil(t, user)
}
