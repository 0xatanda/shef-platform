package services

import (
	"context"
	"errors"
	"fmt"
	"math"
	"time"

	"github.com/0xatanda/shef-platform/internal/dto"
	"github.com/0xatanda/shef-platform/internal/models"
	"github.com/0xatanda/shef-platform/pkg/utils"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ProjectService struct {
	projects     ProjectRepository
	projectMedia ProjectMediaRepository
	contentMedia ContentMediaRepository
}

func NewProjectService(
	projects ProjectRepository,
	projectMedia ProjectMediaRepository,
	contentMedia ContentMediaRepository,
) *ProjectService {
	return &ProjectService{
		projects:     projects,
		projectMedia: projectMedia,
		contentMedia: contentMedia,
	}
}

func (s *ProjectService) generateUniqueSlug(
	ctx context.Context,
	title string,
) (string, error) {
	baseSlug := utils.GenerateSlug(title)

	if baseSlug == "" {
		return "", errors.New("project title cannot generate a valid slug")
	}

	projectSlug := baseSlug
	counter := 2

	for {
		exists, err := s.projects.ExistsBySlug(
			ctx,
			projectSlug,
		)

		if err != nil {
			return "", fmt.Errorf(
				"failed to check project slug: %w",
				err,
			)
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
	if req.Title == "" {
		return nil, errors.New("project title is required")
	}

	if req.Content == "" {
		return nil, errors.New("project content is required")
	}

	projectSlug, err := s.generateUniqueSlug(
		ctx,
		req.Title,
	)

	if err != nil {
		return nil, err
	}

	status := models.ProjectStatus(req.Status)

	if status == "" {
		status = models.ProjectDraft
	}

	project := &models.Project{
		Title:         req.Title,
		Slug:          projectSlug,
		Summary:       req.Summary,
		Content:       req.Content,
		FeaturedImage: req.FeaturedImage,
		Status:        status,
		CreatedBy:     userID,
		UpdatedBy:     userID,
	}

	if status == models.ProjectPublished {
		now := time.Now()

		project.PublishedAt = &now
		project.PublishedBy = &userID
	}

	if err := s.projects.Create(
		ctx,
		project,
	); err != nil {
		return nil, fmt.Errorf(
			"failed to create project: %w",
			err,
		)
	}

	return s.buildProjectResponse(
		ctx,
		project,
	)
}

func (s *ProjectService) ListProjects(
	ctx context.Context,
	page int,
	limit int,
	search string,
	status string,
) (*dto.ProjectListResponse, error) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 {
		limit = 10
	}

	projects, total, err := s.projects.List(
		ctx,
		page,
		limit,
		search,
		status,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.ProjectListItem,
		0,
		len(projects),
	)

	for _, p := range projects {
		items = append(
			items,
			dto.ProjectListItem{
				ID:            p.ID.String(),
				Title:         p.Title,
				Slug:          p.Slug,
				Summary:       p.Summary,
				FeaturedImage: p.FeaturedImage,
				Status:        string(p.Status),
				PublishedAt:   p.PublishedAt,
			},
		)
	}

	totalPages := int(
		(total + int64(limit) - 1) / int64(limit),
	)

	return &dto.ProjectListResponse{
		Items: items,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ProjectService) GetProject(
	ctx context.Context,
	id string,
) (*dto.ProjectResponse, error) {
	projectID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid project id")
	}

	project, err := s.projects.FindByID(
		ctx,
		projectID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, errors.New("project not found")
		}

		return nil, err
	}

	return s.buildProjectResponse(
		ctx,
		project,
	)
}

func (s *ProjectService) UpdateProject(
	ctx context.Context,
	id string,
	userID uuid.UUID,
	req dto.UpdateProjectRequest,
) (*dto.ProjectResponse, error) {
	projectID, err := uuid.Parse(id)

	if err != nil {
		return nil, errors.New("invalid project id")
	}

	project, err := s.projects.FindByID(
		ctx,
		projectID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, errors.New("project not found")
		}

		return nil, err
	}

	if req.Title == "" {
		return nil, errors.New("project title is required")
	}

	if req.Content == "" {
		return nil, errors.New("project content is required")
	}

	if project.Title != req.Title {
		slug := utils.GenerateSlug(req.Title)

		exists, err := s.projects.ExistsBySlugExceptID(
			ctx,
			slug,
			project.ID,
		)

		if err != nil {
			return nil, err
		}

		if exists {
			return nil, errors.New(
				"project title already exists",
			)
		}

		project.Title = req.Title
		project.Slug = slug
	}

	previousStatus := project.Status

	project.Summary = req.Summary
	project.Content = req.Content
	project.FeaturedImage = req.FeaturedImage

	if req.Status != "" {
		project.Status = models.ProjectStatus(
			req.Status,
		)
	}

	project.UpdatedBy = userID

	if project.Status == models.ProjectPublished &&
		previousStatus != models.ProjectPublished {

		now := time.Now()

		project.PublishedAt = &now
		project.PublishedBy = &userID
	}

	if err := s.projects.Update(
		ctx,
		project,
	); err != nil {
		return nil, err
	}

	return s.buildProjectResponse(
		ctx,
		project,
	)
}

func (s *ProjectService) DeleteProject(
	ctx context.Context,
	id string,
) error {
	projectID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid project id")
	}

	_, err = s.projects.FindByID(
		ctx,
		projectID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New("project not found")
		}

		return err
	}

	return s.projects.Delete(
		ctx,
		projectID,
	)
}

func (s *ProjectService) RestoreProject(
	ctx context.Context,
	id string,
) error {
	projectID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid project id")
	}

	return s.projects.Restore(
		ctx,
		projectID,
	)
}

func (s *ProjectService) PermanentDeleteProject(
	ctx context.Context,
	id string,
) error {
	projectID, err := uuid.Parse(id)

	if err != nil {
		return errors.New("invalid project id")
	}

	_, err = s.projects.FindDeletedByID(
		ctx,
		projectID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New(
				"project not found or not deleted",
			)
		}

		return err
	}

	return s.projects.PermanentDelete(
		ctx,
		projectID,
	)
}

func (s *ProjectService) ListDeletedProjects(
	ctx context.Context,
	page int,
	limit int,
	search string,
) (*dto.ProjectListResponse, error) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 {
		limit = 10
	}

	projects, total, err := s.projects.ListDeleted(
		ctx,
		page,
		limit,
		search,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.ProjectListItem,
		0,
		len(projects),
	)

	for _, p := range projects {
		items = append(
			items,
			dto.ProjectListItem{
				ID:            p.ID.String(),
				Title:         p.Title,
				Slug:          p.Slug,
				Summary:       p.Summary,
				FeaturedImage: p.FeaturedImage,
				Status:        string(p.Status),
				PublishedAt:   p.PublishedAt,
			},
		)
	}

	totalPages := 0

	if limit > 0 {
		totalPages = int(
			math.Ceil(
				float64(total) / float64(limit),
			),
		)
	}

	return &dto.ProjectListResponse{
		Items: items,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ProjectService) AddProjectMedia(
	ctx context.Context,
	projectID string,
	userID uuid.UUID,
	req dto.AddProjectMediaRequest,
) (*dto.ProjectMediaResponse, error) {
	id, err := uuid.Parse(projectID)

	if err != nil {
		return nil, errors.New("invalid project id")
	}

	mediaID, err := uuid.Parse(req.MediaID)

	if err != nil {
		return nil, errors.New("invalid media id")
	}

	_, err = s.projects.FindByID(
		ctx,
		id,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, errors.New("project not found")
		}

		return nil, err
	}

	media, err := s.contentMedia.FindByID(
		ctx,
		mediaID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, errors.New("media not found")
		}

		return nil, err
	}

	exists, err := s.projectMedia.Exists(
		ctx,
		id,
		mediaID,
	)

	if err != nil {
		return nil, err
	}

	if exists {
		return nil, errors.New(
			"media already attached to project",
		)
	}

	gallery, err := s.projectMedia.ListByProjectID(
		ctx,
		id,
	)

	if err != nil {
		return nil, err
	}

	sortOrder := len(gallery)
	isFeatured := len(gallery) == 0

	projectMedia := &models.ProjectMedia{
		ProjectID:  id,
		MediaID:    mediaID,
		SortOrder:  sortOrder,
		IsFeatured: isFeatured,
		CreatedAt:  time.Now(),
		UpdatedAt:  time.Now(),
	}

	/*
		IMPORTANT:
		The old code created projectMedia in memory
		but never inserted it into the database.

		This is the actual fix for the unusedwrite
		warnings and the project-image attachment bug.
	*/
	if err := s.projectMedia.Create(
		ctx,
		projectMedia,
	); err != nil {
		return nil, fmt.Errorf(
			"failed to attach media to project: %w",
			err,
		)
	}

	if isFeatured {
		if err := s.projectMedia.ClearFeatured(
			ctx,
			id,
		); err != nil {
			return nil, err
		}

		if err := s.projectMedia.SetFeatured(
			ctx,
			projectMedia.ID,
		); err != nil {
			return nil, err
		}

		/*
			Do not call projects.Update() with a partial
			Project struct if that repository uses Save().
			Use the project returned from the repository and
			update its actual FeaturedImage value.
		*/
		project, err := s.projects.FindByID(
			ctx,
			id,
		)

		if err != nil {
			return nil, err
		}

		project.FeaturedImage = media.URL
		project.UpdatedAt = time.Now()

		if err := s.projects.Update(
			ctx,
			project,
		); err != nil {
			return nil, fmt.Errorf(
				"failed to update project featured image: %w",
				err,
			)
		}
	}

	return &dto.ProjectMediaResponse{
		ID:         projectMedia.ID.String(),
		MediaID:    media.ID.String(),
		URL:        media.URL,
		AltText:    req.AltText,
		SortOrder:  projectMedia.SortOrder,
		IsFeatured: projectMedia.IsFeatured,
	}, nil
}

func (s *ProjectService) ListProjectMedia(
	ctx context.Context,
	projectID string,
) ([]dto.ProjectMediaResponse, error) {
	id, err := uuid.Parse(projectID)

	if err != nil {
		return nil, errors.New("invalid project id")
	}

	_, err = s.projects.FindByID(
		ctx,
		id,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, errors.New("project not found")
		}

		return nil, err
	}

	items, err := s.projectMedia.ListByProjectID(
		ctx,
		id,
	)

	if err != nil {
		return nil, err
	}

	result := make(
		[]dto.ProjectMediaResponse,
		0,
		len(items),
	)

	for _, item := range items {
		result = append(
			result,
			dto.ProjectMediaResponse{
				ID:         item.ID.String(),
				MediaID:    item.MediaID.String(),
				URL:        item.Media.URL,
				AltText:    item.Media.AltText,
				SortOrder:  item.SortOrder,
				IsFeatured: item.IsFeatured,
			},
		)
	}

	return result, nil
}

func (s *ProjectService) DeleteProjectMedia(
	ctx context.Context,
	projectID string,
	mediaID string,
) error {
	projectUUID, err := uuid.Parse(projectID)

	if err != nil {
		return errors.New("invalid project id")
	}

	mediaUUID, err := uuid.Parse(mediaID)

	if err != nil {
		return errors.New("invalid media id")
	}

	_, err = s.projects.FindByID(
		ctx,
		projectUUID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New("project not found")
		}

		return err
	}

	item, err := s.projectMedia.FindByID(
		ctx,
		mediaUUID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New("project media not found")
		}

		return err
	}

	if item.ProjectID != projectUUID {
		return errors.New(
			"media does not belong to project",
		)
	}

	wasFeatured := item.IsFeatured

	if err := s.projectMedia.Delete(
		ctx,
		mediaUUID,
	); err != nil {
		return err
	}

	/*
		If the featured image was deleted, promote the
		first remaining image.
	*/
	if wasFeatured {
		gallery, err := s.projectMedia.ListByProjectID(
			ctx,
			projectUUID,
		)

		if err != nil {
			return err
		}

		project, err := s.projects.FindByID(
			ctx,
			projectUUID,
		)

		if err != nil {
			return err
		}

		if len(gallery) == 0 {
			project.FeaturedImage = ""
		} else {
			first := gallery[0]

			if err := s.projectMedia.ClearFeatured(
				ctx,
				projectUUID,
			); err != nil {
				return err
			}

			if err := s.projectMedia.SetFeatured(
				ctx,
				first.ID,
			); err != nil {
				return err
			}

			project.FeaturedImage = first.Media.URL
		}

		project.UpdatedAt = time.Now()

		if err := s.projects.Update(
			ctx,
			project,
		); err != nil {
			return err
		}
	}

	return nil
}

func (s *ProjectService) ReorderProjectMedia(
	ctx context.Context,
	projectID string,
	req dto.UpdateProjectMediaOrderRequest,
) error {
	projectUUID, err := uuid.Parse(projectID)

	if err != nil {
		return errors.New("invalid project id")
	}

	_, err = s.projects.FindByID(
		ctx,
		projectUUID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New("project not found")
		}

		return err
	}

	for _, item := range req.Items {
		mediaUUID, err := uuid.Parse(item.ID)

		if err != nil {
			return errors.New(
				"invalid project media id",
			)
		}

		projectMedia, err := s.projectMedia.FindByID(
			ctx,
			mediaUUID,
		)

		if err != nil {
			if errors.Is(
				err,
				gorm.ErrRecordNotFound,
			) {
				return errors.New(
					"project media not found",
				)
			}

			return err
		}

		if projectMedia.ProjectID != projectUUID {
			return errors.New(
				"media does not belong to project",
			)
		}

		if err := s.projectMedia.UpdateOrder(
			ctx,
			mediaUUID,
			item.SortOrder,
		); err != nil {
			return err
		}
	}

	return nil
}

func (s *ProjectService) buildProjectResponse(
	ctx context.Context,
	project *models.Project,
) (*dto.ProjectResponse, error) {
	if project == nil {
		return nil, errors.New(
			"cannot build response for nil project",
		)
	}

	media, err := s.ListProjectMedia(
		ctx,
		project.ID.String(),
	)

	if err != nil {
		return nil, fmt.Errorf(
			"failed to load project media: %w",
			err,
		)
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
		Media:         media,
	}, nil
}

func (s *ProjectService) SetFeaturedProjectMedia(
	ctx context.Context,
	projectID string,
	mediaID string,
) error {
	projectUUID, err := uuid.Parse(projectID)

	if err != nil {
		return errors.New("invalid project id")
	}

	mediaUUID, err := uuid.Parse(mediaID)

	if err != nil {
		return errors.New("invalid project media id")
	}

	project, err := s.projects.FindByID(
		ctx,
		projectUUID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New("project not found")
		}

		return err
	}

	projectMedia, err := s.projectMedia.FindByID(
		ctx,
		mediaUUID,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return errors.New("project media not found")
		}

		return err
	}

	if projectMedia.ProjectID != projectUUID {
		return errors.New(
			"media does not belong to project",
		)
	}

	if err := s.projectMedia.ClearFeatured(
		ctx,
		projectUUID,
	); err != nil {
		return err
	}

	if err := s.projectMedia.SetFeatured(
		ctx,
		mediaUUID,
	); err != nil {
		return err
	}

	project.FeaturedImage = projectMedia.Media.URL
	project.UpdatedAt = time.Now()

	return s.projects.Update(
		ctx,
		project,
	)
}

func (s *ProjectService) ListPublishedProjects(
	ctx context.Context,
	page int,
	limit int,
	search string,
) (*dto.ProjectListResponse, error) {
	if page <= 0 {
		page = 1
	}

	if limit <= 0 {
		limit = 10
	}

	projects, total, err := s.projects.ListPublished(
		ctx,
		page,
		limit,
		search,
	)

	if err != nil {
		return nil, err
	}

	items := make(
		[]dto.ProjectListItem,
		0,
		len(projects),
	)

	for _, p := range projects {
		items = append(
			items,
			dto.ProjectListItem{
				ID:            p.ID.String(),
				Title:         p.Title,
				Slug:          p.Slug,
				Summary:       p.Summary,
				FeaturedImage: p.FeaturedImage,
				Status:        string(p.Status),
				PublishedAt:   p.PublishedAt,
			},
		)
	}

	totalPages := int(
		(total + int64(limit) - 1) / int64(limit),
	)

	return &dto.ProjectListResponse{
		Items: items,
		Pagination: dto.Pagination{
			Page:       page,
			Limit:      limit,
			Total:      total,
			TotalPages: totalPages,
		},
	}, nil
}

func (s *ProjectService) GetPublishedProject(
	ctx context.Context,
	slug string,
) (*dto.ProjectResponse, error) {

	if slug == "" {
		return nil, errors.New("project slug is required")
	}

	project, err := s.projects.FindPublishedBySlug(
		ctx,
		slug,
	)

	if err != nil {
		if errors.Is(
			err,
			gorm.ErrRecordNotFound,
		) {
			return nil, errors.New(
				"project not found",
			)
		}

		return nil, err
	}

	return s.buildProjectResponse(
		ctx,
		project,
	)
}
