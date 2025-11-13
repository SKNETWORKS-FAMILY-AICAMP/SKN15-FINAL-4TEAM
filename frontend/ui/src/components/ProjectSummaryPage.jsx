import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { getProjectAiImages } from "../api/projectAPI";
import "../styles/ProjectSummaryPage.css";

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
  const memoStorageKey = useMemo(
    () => (projectId ? `design_memo_${projectId}` : "design_memo"),
    [projectId]
  );
  const [concepts, setConcepts] = useState([]);
  const [primaryId, setPrimaryId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [designMemoInput, setDesignMemoInput] = useState("");
  const [memoSaved, setMemoSaved] = useState(false);

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
      }));
        setConcepts(mapped);
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

  const customerRequirement = useMemo(() => {
    if (!primaryImage) return "요청된 디자인 정보를 불러오지 못했습니다.";
    const items = [
      primaryImage.residenceType && `주거 형태: ${primaryImage.residenceType}`,
      primaryImage.spaceType && `공간: ${primaryImage.spaceType}`,
      primaryImage.familyType && `가족 구성: ${primaryImage.familyType}`,
      primaryImage.designStyle && `스타일: ${primaryImage.designStyle}`,
      primaryImage.budgetRange && `예산: ${primaryImage.budgetRange}`,
    ].filter(Boolean);
    return items.length ? items.join(" · ") : "요청된 디자인 정보를 불러오지 못했습니다.";
  }, [primaryImage]);

  const defaultDesignMemo = useMemo(() => {
    if (!primaryImage) {
      return "선택한 이미지를 기반으로 디자인 메모를 작성할 수 있습니다.";
    }
    const style = primaryImage.designStyle || "스타일";
    const space = primaryImage.spaceType || "공간";
    return `${style} 무드를 중심으로 ${space}의 동선을 부드럽게 정리했습니다. 소재 대비를 줄이고 채광을 살려 포인트 컬러가 자연스럽게 묻어나도록 계획했습니다.`;
  }, [primaryImage]);

  useEffect(() => {
    if (!primaryImage) return;
    setDesignMemoInput((prev) => {
      if (prev) return prev;
      const stored = memoStorageKey ? localStorage.getItem(memoStorageKey) : "";
      if (stored) return stored;
      return defaultDesignMemo;
    });
  }, [primaryImage, memoStorageKey, defaultDesignMemo]);

  const specificationEntries = useMemo(() => {
    const furnitureNames =
      primaryImage?.catalogFurnitures
        ?.map((item) => item.name || item.goods_name)
        .filter(Boolean) ?? [];

    if (!primaryImage) {
      return [
        { label: "스타일", value: "-" },
        { label: "주요 공간", value: "-" },
        { label: "예산", value: "-" },
        { label: "가족 구성", value: "-" },
        { label: "사용 가구", value: "-" },
      ];
    }

    const entries = [
      { label: "스타일", value: primaryImage.designStyle || "-" },
      { label: "주요 공간", value: primaryImage.spaceType || "-" },
      { label: "예산", value: primaryImage.budgetRange || "-" },
      { label: "가족 구성", value: primaryImage.familyType || "-" },
    ];

    if (furnitureNames.length) {
      entries.push({
        label: "사용 가구",
        value: furnitureNames.join(", "),
      });
    }

    return entries;
  }, [primaryImage]);

  const handleSelectImage = (conceptId) => {
    setPrimaryId(conceptId);
  };

  const handleBackToResults = () => {
    navigate(`/results/${projectId}`, { replace: false });
  };

  const handleSaveMemo = () => {
    if (!memoStorageKey) return;
    localStorage.setItem(memoStorageKey, designMemoInput.trim());
    setMemoSaved(true);
    setTimeout(() => setMemoSaved(false), 2000);
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
          <span>완성된 AI 시안을 기반으로 고객에게 전달할 자료입니다.</span>
        </div>
      </header>

      <section className="summary-info-grid">
        <article className="summary-card summary-card--light">
          <div className="summary-card__title">고객 요구사항</div>
          <p className="summary-card__rating">★★★★★</p>
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
            {memoSaved && <span className="summary-memo-status">저장되었습니다.</span>}
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
              <img src={primaryImage.imageUrl} alt={primaryImage.title} />
            ) : (
              <div className="summary-hero__placeholder">이미지를 불러올 수 없습니다.</div>
            )}
          </div>
        </article>
        <aside className="summary-spec">
          <div className="summary-section-title">설계 및 설명서</div>
          <ul>
            {specificationEntries.map((entry) => (
              <li key={entry.label}>
                <span>{entry.label}</span>
                <strong>{entry.value || "-"}</strong>
              </li>
            ))}
          </ul>
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
