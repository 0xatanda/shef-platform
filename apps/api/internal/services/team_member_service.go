package services

import (
	"context"
	"errors"
	"math"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/internal/repositories"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type TeamMemberService struct {
	members *repositories.TeamMemberRepository
}

func NewTeamMemberService(
	repo *repositories.TeamMemberRepository,
) *TeamMemberService {
	return &TeamMemberService{
		members: repo,
	}
}

func (s *TeamMemberService) Create(
	ctx context.Context,
	req dto.CreateTeamMemberRequest,
) (*dto.TeamMemberResponse, error) {

	member := &models.TeamMember{
		Name:      req.Name,
		Role:      req.Role,
		Bio:       req.Bio,
		ImageURL:  req.ImageURL,
		Email:     req.Email,
		LinkedIn:  req.LinkedIn,
		Twitter:   req.Twitter,
		SortOrder: req.SortOrder,
		IsActive:  req.IsActive,
	}

	if err := s.members.Create(ctx, member); err != nil {
		return nil, err
	}

	return s.toResponse(member), nil
}

func (s *TeamMemberService) Get(
	ctx context.Context,
	id string,
) (*dto.TeamMemberResponse, error) {

	memberID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid team member id")
	}

	member, err := s.members.FindByID(ctx, memberID)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("team member not found")
		}

		return nil, err
	}

	return s.toResponse(member), nil
}

func (s *TeamMemberService) List(
	ctx context.Context,
	page int,
	limit int,
) (*dto.TeamMemberListResponse, error) {

	if page < 1 {
		page = 1
	}

	if limit < 1 {
		limit = 10
	}

	if limit > 100 {
		limit = 100
	}

	members, total, err := s.members.List(
		ctx,
		page,
		limit,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.TeamMemberResponse,
		0,
		len(members),
	)

	for _, member := range members {
		items = append(
			items,
			*s.toResponse(&member),
		)
	}

	totalPages := int(
		math.Ceil(
			float64(total) / float64(limit),
		),
	)

	return &dto.TeamMemberListResponse{
		Items: items,
		Pagination: dto.PaginationResponse{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *TeamMemberService) ListActive(
	ctx context.Context,
) ([]dto.TeamMemberResponse, error) {

	members, err := s.members.ListActive(ctx)

	if err != nil {
		return nil, err
	}

	result := make(
		[]dto.TeamMemberResponse,
		0,
		len(members),
	)

	for _, member := range members {
		result = append(
			result,
			*s.toResponse(&member),
		)
	}

	return result, nil
}

func (s *TeamMemberService) Update(
	ctx context.Context,
	id string,
	req dto.UpdateTeamMemberRequest,
) (*dto.TeamMemberResponse, error) {

	memberID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid team member id")
	}

	member, err := s.members.FindByID(
		ctx,
		memberID,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("team member not found")
		}

		return nil, err
	}

	member.Name = req.Name
	member.Role = req.Role
	member.Bio = req.Bio
	member.ImageURL = req.ImageURL
	member.Email = req.Email
	member.LinkedIn = req.LinkedIn
	member.Twitter = req.Twitter
	member.SortOrder = req.SortOrder
	member.IsActive = req.IsActive

	if err := s.members.Update(ctx, member); err != nil {
		return nil, err
	}

	return s.toResponse(member), nil
}

func (s *TeamMemberService) Delete(
	ctx context.Context,
	id string,
) error {

	memberID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid team member id")
	}

	_, err = s.members.FindByID(
		ctx,
		memberID,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("team member not found")
		}

		return err
	}

	return s.members.Delete(ctx, memberID)
}

func (s *TeamMemberService) toResponse(
	member *models.TeamMember,
) *dto.TeamMemberResponse {

	return &dto.TeamMemberResponse{
		ID:        member.ID.String(),
		Name:      member.Name,
		Role:      member.Role,
		Bio:       member.Bio,
		ImageURL:  member.ImageURL,
		Email:     member.Email,
		LinkedIn:  member.LinkedIn,
		Twitter:   member.Twitter,
		SortOrder: member.SortOrder,
		IsActive:  member.IsActive,
		CreatedAt: member.CreatedAt,
		UpdatedAt: member.UpdatedAt,
	}
}
