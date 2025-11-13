import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import DesignResultsGallery from "./DesignResultsGallery";
import ImageRefineModal from "./ImageRefineModal";
import { getProjectAiImages, refineProjectImage } from "../api/projectAPI";
import "../styles/ResultsPage.css";

function ResultsPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [concepts, setConcepts] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRefineOpen, setIsRefineOpen] = useState(false);
  const [refineIndex, setRefineIndex] = useState(0);
  const [isRefineLoading, setIsRefineLoading] = useState(false);
  const [refineError, setRefineError] = useState(null);

  const fetchImages = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);
    setError(null);

    try {
      const images = await getProjectAiImages(projectId);
      const mapped = images.map((image, index) => ({
        id: image.image_id?.toString() || `ai-${index}`,
        imageId: image.image_id,
        sourceImageId: image.source_image_id ?? null,
        title: image.design_style || `디자인 컨셉 ${index + 1}`,
        description:
          image.residence_type ||
          image.family_type ||
          image.space_type ||
          "생성된 인테리어 디자인",
        imageUrl: image.image_url,
        isSelected: image.is_selected,
        designStyle: image.design_style,
        residenceType: image.residence_type,
        spaceType: image.space_type,
        budgetRange: image.budget_range,
        familyType: image.family_type,
        catalogFurnitures: image.catalog_furnitures || [],
      }));

      const sorted = [...mapped].sort((a, b) => {
        const aRefined = a.sourceImageId ? 1 : 0;
        const bRefined = b.sourceImageId ? 1 : 0;
        if (aRefined !== bRefined) {
          return aRefined - bRefined;
        }
        return (a.imageId || 0) - (b.imageId || 0);
      });

      const preselected = sorted
        .filter((item) => item.isSelected)
        .map((item) => item.id);

      setConcepts(sorted);
      setSelectedIds(preselected);
    } catch (err) {
      console.error("❌ AI 이미지 로드 실패:", err);
      setError("AI 이미지를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const galleryConcepts = useMemo(() => concepts, [concepts]);

  const handleCompleteSelection = (currentSelection) => {
    const selection = currentSelection && currentSelection.length ? currentSelection : selectedIds;
    if (selection.length === 0) return;
    navigate(`/results/${projectId}/summary`, {
      state: { selectedImageIds: selection },
    });
  };

  const handleOpenRefine = (index) => {
    setRefineError(null);
    setRefineIndex(index);
    setIsRefineOpen(true);
  };

  const handleCloseRefine = () => {
    if (isRefineLoading) return;
    setIsRefineOpen(false);
    setRefineError(null);
  };

  const handleSubmitRefine = async (index, prompt) => {
    const target = galleryConcepts[index];
    if (!target?.imageId) {
      setRefineError("선택한 이미지를 찾을 수 없습니다.");
      return;
    }

    setIsRefineLoading(true);
    setRefineError(null);

    try {
      await refineProjectImage(projectId, target.imageId, prompt);
      await fetchImages();
      setIsRefineOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.error || "부분 수정 중 오류가 발생했습니다.";
      setRefineError(message);
    } finally {
      setIsRefineLoading(false);
    }
  };

  return (
    <main className="results-layout">
      <header className="results-layout__header">
        <button
          type="button"
          className="results-layout__back"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> 프로젝트 목록으로
        </button>
        <h1>AI 생성 디자인 결과</h1>
        <span className="results-layout__project">Project #{projectId}</span>
      </header>

      {isLoading ? (
        <div className="results-layout__status">AI 이미지를 불러오는 중...</div>
      ) : error ? (
        <div className="results-layout__status results-layout__status--error">
          {error}
        </div>
      ) : (
        <DesignResultsGallery
          concepts={galleryConcepts}
          defaultSelectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onRequestRefine={handleOpenRefine}
          onComplete={handleCompleteSelection}
        />
      )}

      <ImageRefineModal
        isOpen={isRefineOpen}
        concepts={galleryConcepts}
        activeIndex={refineIndex}
        onClose={handleCloseRefine}
        onSubmit={handleSubmitRefine}
        isSubmitting={isRefineLoading}
        errorMessage={refineError}
      />
    </main>
  );
}

export default ResultsPage;
