package services

import (
	"context"
	"fmt"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/utils"
	"github.com/google/uuid"
)

type ProjectService struct {
	projects ProjectRepository
}

func NewProjectService(
	projects ProjectRepository,
) *ProjectService {
	return &ProjectService{
		projects: projects,
	}
}

func (s *ProjectService) generateUniqueSlug(
	ctx context.Context,
	title string,
) (string, error) {

	baseSlug := utils.GenerateSlug(title)
	projectSlug := baseSlug

	counter := 2

	for {
		exists, err := s.projects.ExistsBySlug(
			ctx,
			projectSlug,
		)

		if err != nil {
			return "", err
		}

		if !exists {
			return projectSlug, nil
		}

		projectSlug = fmt.Sprintf(
			"%s-%d",
			baseSlug,
			counter,
		)

		counter++
	}
}

func (s *ProjectService) CreateProject(
	ctx context.Context,
	userID uuid.UUID,
	req dto.CreateProjectRequest,
) (*dto.ProjectResponse, error) {

	projectSlug, err := s.generateUniqueSlug(
		ctx,
		req.Title,
	)
	if err != nil {
		return nil, err
	}

	project := &models.Project{
		Title:         req.Title,
		Slug:          projectSlug,
		Summary:       req.Summary,
		Content:       req.Content,
		FeaturedImage: req.FeaturedImage,
		Status:        models.ProjectStatus(req.Status),

		CreatedBy: userID,
		UpdatedBy: userID,
	}

	if project.Status == "" {
		project.Status = models.ProjectDraft
	}

	if err := s.projects.Create(
		ctx,
		project,
	); err != nil {
		return nil, err
	}

	return &dto.ProjectResponse{
		ID:            project.ID.String(),
		Title:         project.Title,
		Slug:          project.Slug,
		Summary:       project.Summary,
		Content:       project.Content,
		FeaturedImage: project.FeaturedImage,
		Status:        string(project.Status),
		PublishedAt:   project.PublishedAt,
		CreatedAt:     project.CreatedAt,
		UpdatedAt:     project.UpdatedAt,
	}, nil
}
