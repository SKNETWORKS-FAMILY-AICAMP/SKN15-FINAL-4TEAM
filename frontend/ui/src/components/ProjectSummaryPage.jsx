import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { getProjectAiImages, saveDesignMemo, updateProjectStatus } from "../api/projectAPI";
import { getStatusInfo, STATUS_OPTIONS, normalizeStatus } from "../utils/statusStyles";
import { SPACE_OPTIONS, COST_OPTIONS, STYLE_OPTIONS } from "../utils/categoryOptions";
import "../styles/ProjectSummaryPage.css";

const resolveOptionLabel = (options, value) => {
  if (!value) return "";
  const normalized = value.toString().trim();
  const match = options.find(
    (option) => option.code === normalized || option.name === normalized
  );
  return match ? match.name : value;
};

function ProjectSummaryPage() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedFromState = useMemo(
    () =>
      Array.isArray(location.state?.selectedImageIds)
        ? location.state.selectedImageIds
        : [],
    [location.state]
  );
  const [concepts, setConcepts] = useState([]);
  const [primaryId, setPrimaryId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [designMemoInput, setDesignMemoInput] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);
  const [memoError, setMemoError] = useState(null);
  const [projectStatus, setProjectStatus] = useState(null);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [statusError, setStatusError] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const statusControlRef = useRef(null);

  useEffect(() => {
    const load = async () => {
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
          designStyle: image.design_style,
          residenceType: image.residence_type,
          spaceType: image.space_type,
          budgetRange: image.budget_range,
          familyType: image.family_type,
          catalogFurnitures: image.catalog_furnitures || [],
          designMemo: image.design_memo || "",
          designMemoSllm: image.design_memo_sllm || "",
        }));
        setConcepts(mapped);
        if (images && images.length > 0) {
          setProjectStatus(normalizeStatus(images[0].project_status || "pending"));
        }
        const prioritized =
          selectedFromState.find((id) =>
            mapped.some((concept) => concept.id === id)
          ) || mapped[0]?.id;
        setPrimaryId(prioritized || null);
      } catch (err) {
        console.error("❌ 결과 요약 조회 실패:", err);
        setError("결과 페이지를 불러오는 중 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [projectId, selectedFromState]);

  const primaryImage = useMemo(
    () => concepts.find((concept) => concept.id === primaryId) || concepts[0] || null,
    [concepts, primaryId]
  );

  const secondaryImages = useMemo(() => {
    if (!primaryImage) return [];
    return concepts.filter((concept) => concept.id !== primaryImage.id);
  }, [concepts, primaryImage]);

  const friendlySpace = useMemo(
    () => resolveOptionLabel(SPACE_OPTIONS, primaryImage?.spaceType),
    [primaryImage?.spaceType]
  );
  const friendlyBudget = useMemo(
    () => resolveOptionLabel(COST_OPTIONS, primaryImage?.budgetRange),
    [primaryImage?.budgetRange]
  );
  const friendlyStyle = useMemo(
    () => resolveOptionLabel(STYLE_OPTIONS, primaryImage?.designStyle),
    [primaryImage?.designStyle]
  );

  const customerRequirement = useMemo(() => {
    if (!primaryImage) return "요청된 디자인 정보를 불러오지 못했습니다.";
    const items = [
      primaryImage.residenceType && `주거 형태: ${primaryImage.residenceType}`,
      friendlySpace && `공간: ${friendlySpace}`,
      primaryImage.familyType && `가족 구성: ${primaryImage.familyType}`,
      friendlyStyle && `스타일: ${friendlyStyle}`,
      friendlyBudget && `예산: ${friendlyBudget}`,
    ].filter(Boolean);
    return items.length ? items.join(" · ") : "요청된 디자인 정보를 불러오지 못했습니다.";
  }, [primaryImage, friendlySpace, friendlyStyle, friendlyBudget]);

  const defaultDesignMemo = useMemo(() => {
    if (!primaryImage) {
      return "선택한 이미지를 기반으로 디자인 메모를 작성할 수 있습니다.";
    }
    const style = friendlyStyle || "스타일";
    const space = friendlySpace || "공간";
    return `${style} 무드를 중심으로 ${space}의 동선을 부드럽게 정리했습니다. 소재 대비를 줄이고 채광을 살려 포인트 컬러가 자연스럽게 묻어나도록 계획했습니다.`;
  }, [primaryImage, friendlyStyle, friendlySpace]);

  useEffect(() => {
    if (!primaryImage) return;
    setDesignMemoInput(primaryImage.designMemo?.trim() || "");
    setMemoError(null);
    setMemoSaved(false);
  }, [primaryImage, defaultDesignMemo]);

  useEffect(() => {
    if (!isStatusMenuOpen) return;
    const handleClickOutside = (event) => {
      if (statusControlRef.current && !statusControlRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isStatusMenuOpen]);

  const sllmExplanation = useMemo(() => {
    if (!primaryImage) {
      return "SLLM 디자인 설명을 불러오지 못했습니다.";
    }
    const memoText = (primaryImage.designMemoSllm || "").trim();
    return memoText || defaultDesignMemo;
  }, [primaryImage, defaultDesignMemo]);

  const usedFurnitureList = useMemo(() => {
    if (!primaryImage?.catalogFurnitures) {
      return [];
    }
    return primaryImage.catalogFurnitures
      .map((item, index) => {
        const name = (item?.goods_name || item?.name || "").trim();
        if (!name) return null;
        const url = (item?.url || item?.link || "").trim();
        return {
          key: `${name}-${item?.goods_id || index}`,
          name,
          url: url || null,
        };
      })
      .filter(Boolean);
  }, [primaryImage]);

  const handleSelectImage = (conceptId) => {
    setPrimaryId(conceptId);
  };

  const handleBackToResults = () => {
    navigate(`/results/${projectId}`, { replace: false });
  };

  const handleSaveMemo = async () => {
    if (!primaryImage?.imageId || !projectId) return;
    setMemoError(null);
    try {
      await saveDesignMemo(projectId, primaryImage.imageId, designMemoInput.trim());
      setConcepts((prev) =>
        prev.map((concept) =>
          concept.id === primaryImage.id
            ? { ...concept, designMemo: designMemoInput.trim() }
            : concept
        )
      );
      setMemoSaved(true);
      setTimeout(() => setMemoSaved(false), 2000);
    } catch (err) {
      const message =
        err.response?.data?.error || "디자인 메모를 저장하지 못했습니다.";
      setMemoError(message);
    }
  };

  const normalizedStatus = normalizeStatus(projectStatus || "pending");
  const statusInfo = getStatusInfo(normalizedStatus);

  const handleOpenImageNewTab = useCallback(() => {
    if (primaryImage?.imageUrl) {
      window.open(primaryImage.imageUrl, "_blank", "noopener,noreferrer");
    }
  }, [primaryImage?.imageUrl]);

  const handleStatusSelect = async (nextValue) => {
    const targetStatus = normalizeStatus(nextValue);
    if (!projectId) {
      setIsStatusMenuOpen(false);
      return;
    }
    if (targetStatus === normalizedStatus) {
      setIsStatusMenuOpen(false);
      return;
    }
    setIsUpdatingStatus(true);
    setStatusError(null);
    try {
      await updateProjectStatus(projectId, targetStatus);
      setProjectStatus(targetStatus);
      setIsStatusMenuOpen(false);
    } catch (err) {
      const message =
        err.response?.data?.error || "프로젝트 상태를 변경하지 못했습니다.";
      setStatusError(message);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <main className="summary-layout">
        <div className="summary-status">결과 화면을 준비 중입니다...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="summary-layout">
        <div className="summary-status summary-status--error">{error}</div>
      </main>
    );
  }

  if (!primaryImage) {
    return (
      <main className="summary-layout">
        <div className="summary-status summary-status--error">
          표시할 이미지가 없습니다. 다시 돌아가 이미지를 생성해 주세요.
        </div>
      </main>
    );
  }

  return (
    <main className="summary-layout">
      <header className="summary-header">
        <button type="button" className="summary-back" onClick={handleBackToResults}>
          <FaArrowLeft /> 결과 목록으로
        </button>
        <div className="summary-title">
          <p>최종 시안 보드</p>
        </div>
        <div className="summary-status-control" ref={statusControlRef}>
          <button
            type="button"
            className="summary-status-chip"
            style={{
              background: statusInfo.gradient,
              color: statusInfo.textColor,
              boxShadow: statusInfo.shadow,
            }}
            onClick={() => setIsStatusMenuOpen((prev) => !prev)}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? "변경 중..." : statusInfo.label}
          </button>
          {isStatusMenuOpen && (
            <div className="summary-status-dropdown">
              {STATUS_OPTIONS.map((option) => {
                const optionStatus = normalizeStatus(option.value);
                const optionInfo = getStatusInfo(optionStatus);
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`summary-status-option${
                      optionStatus === normalizedStatus ? " is-active" : ""
                    }`}
                    onClick={() => handleStatusSelect(option.value)}
                    disabled={isUpdatingStatus}
                  >
                    <span>{option.label}</span>
                    {optionStatus === normalizedStatus && <span>선택됨</span>}
                    <span
                      className="summary-status-option__dot"
                      style={{ background: optionInfo.gradient }}
                    />
                  </button>
                );
              })}
            </div>
          )}
          {statusError && <span className="summary-status-error">{statusError}</span>}
        </div>
      </header>

      <section className="summary-info-grid">
        <article className="summary-card summary-card--light">
          <div className="summary-card__title">고객 요구사항</div>
          <p className="summary-card__text">{customerRequirement}</p>
        </article>
        <article className="summary-card summary-card--memo">
          <div className="summary-card__title">Design Memo</div>
          <textarea
            className="summary-memo-input"
            value={designMemoInput}
            onChange={(event) => setDesignMemoInput(event.target.value)}
            placeholder="디자이너 메모를 입력하세요."
            rows={5}
          />
          <div className="summary-memo-actions">
            <div className="summary-memo-messages">
              {memoSaved && <span className="summary-memo-status">저장되었습니다.</span>}
              {memoError && <span className="summary-memo-error">{memoError}</span>}
            </div>
            <button type="button" onClick={handleSaveMemo}>
              메모 저장
            </button>
          </div>
        </article>
      </section>

      <section className="summary-main">
        <article className="summary-hero">
          <div className="summary-section-title">AI 솔루션</div>
          <div className="summary-hero__frame">
            {primaryImage?.imageUrl ? (
              <button
                type="button"
                className="summary-hero__frame-button"
                onClick={handleOpenImageNewTab}
              >
                <img src={primaryImage.imageUrl} alt={primaryImage.title} />
                <span className="summary-hero__frame-hint">이미지 전체 보기</span>
              </button>
            ) : (
              <div className="summary-hero__placeholder">이미지를 불러올 수 없습니다.</div>
            )}
          </div>
        </article>
        <aside className="summary-spec">
          <div className="summary-section-title">설계 및 설명서</div>
          <p className="summary-card__text">{sllmExplanation}</p>
          {usedFurnitureList.length > 0 && (
            <div className="summary-spec__furnitures">
              <div className="summary-spec__subtitle">사용한 한샘 가구</div>
              <ul>
                {usedFurnitureList.map((item) => (
                  <li key={item.key}>
                    <span>{item.name}</span>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        링크 열기
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>

      {secondaryImages.length > 0 && (
        <section className="summary-thumbnails">
          <div className="summary-section-title">인터리어 트렌드</div>
          <div className="summary-thumb-strip">
            {secondaryImages.map((concept) => (
              <button
                key={concept.id}
                type="button"
                className={`summary-thumb ${concept.id === primaryImage.id ? "is-active" : ""}`}
                onClick={() => handleSelectImage(concept.id)}
              >
                {concept.imageUrl ? (
                  <img src={concept.imageUrl} alt={concept.title} />
                ) : (
                  <div className="summary-thumb__placeholder">이미지를 준비 중입니다.</div>
                )}
                <span>{concept.title || "AI 이미지"}</span>
                {concept.sourceImageId && (
                  <small>수정본 · 원본 #{concept.sourceImageId}</small>
                )}
              </button>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProjectSummaryPage;
