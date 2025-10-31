import React, { useState } from "react";
import "../styles/ResultsPage.css";
import { FaBell, FaEllipsisV, FaCheckCircle, FaCircle, FaTimes, FaChevronLeft, FaChevronRight, FaMagic, FaArrowLeft } from "react-icons/fa";

const initialDesigns = [
  {
    id: "c1",
    name: "모던 미니멀리즘",
    desc: "간결하고 절제된 디자인으로 깔끔하고 넓어 보이는 공간을 연출합니다. 무채색 계열, 직선적 가구, 도시적 감각.",
    img: "https://octapi.lxzin.com/imageBlockProp/image/202407/26/720/0/8be6a596-d263-4628-81e1-4302fc16c27e.jpg",
  },
  {
    id: "c2",
    name: "따뜻한 북유럽",
    desc: "밝은 원목+파스텔톤, 자연광, 실용적 가구로 따뜻하고 아늑한 분위기.",
    img: "https://i0.wp.com/blog.signifykorea.com/wp-content/uploads/2019/03/ed9584eba6bdec8aa4_led_eb8db0ecbd94_ed9584eb9dbceba998ed8ab8_eca084eab5ac_1-1.jpg?fit=736%2C537&ssl=1",
  },
  {
    id: "c3",
    name: "인더스트리얼 시크",
    desc: "노출 콘크리트/금속/거친 목재, 빈티지 조명으로 거칠고 세련된 무드.",
    img: "https://mblogthumb-phinf.pstatic.net/MjAxNzExMjdfMTIz/MDAxNTExNzYwMjc0MTE4.ZU4ha6OU0XZSfTEHP1L7qIF6HPloT-w4M1l0wsFOC20g.EUwpSofLG4-gmktqQfPzdSETAPgsValXWwdmAkEAyfQg.JPEG.ideaall/1_%281%29.jpg?type=w800",
  },
];

function ResultsPage() {
  const [designs, setDesigns] = useState(initialDesigns);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalData, setModalData] = useState(null);

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModal = (design) => {
    setModalData(design);
  };

  const closeModal = () => {
    setModalData(null);
  };

  return (
    <div className="results-page">
      <header className="header">
        <div className="logo">Arch-GPT</div>
        <div className="right">
          <FaBell />
          <FaEllipsisV />
        </div>
      </header>

      <div className="container">
        <section className="selection-view">
          <div className="content-header panel">
            <h1>Review & Select Design Concepts</h1>
            <p className="muted">
              원하는 카드 여러 개를 선택하고, 썸네일을 클릭하면 팝업에서 Before/After를
              미리보기 할 수 있습니다.
            </p>
            <p className="step-info">Step 2/4 · 복수선택 지원</p>
          </div>

          <div className="design-grid">
            {designs.map((d) => (
              <div
                key={d.id}
                className={`design-option ${
                  selectedIds.includes(d.id) ? "selected" : ""
                }`}
                onClick={(e) => {
                  if (e.target.tagName === "IMG") openModal(d);
                  else toggleSelect(d.id);
                }}
              >
                <img src={d.img} alt={d.name} />
                <div className="design-info">
                  <p>{d.name}</p>
                  {selectedIds.includes(d.id) ? (
                    <FaCheckCircle className="select-icon" color="#2563eb" />
                  ) : (
                    <FaCircle className="select-icon" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="actions">
            <button className="btn btn-primary">
              <FaCheckCircle /> &nbsp;Select This Concept
            </button>
          </div>
        </section>
      </div>

      {modalData && (
        <div className="modal">
          <div className="modal-content-wrapper">
            <div className="modal-header">
              <div className="modal-title">{modalData.name}</div>
              <span className="close" onClick={closeModal}>
                <FaTimes />
              </span>
            </div>
            <div className="modal-body">
              <div className="modal-sections">
                <div className="modal-card">
                  <img src={modalData.img} alt={modalData.name} />
                </div>
                <div className="modal-card">
                  <strong>{modalData.name}</strong>
                  <p className="muted">{modalData.desc}</p>
                  <textarea
                    className="input-box"
                    placeholder="수정할 사안을 입력하세요"
                  ></textarea>
                  <div className="gen-actions">
                    <button className="btn btn-success">
                      <FaMagic /> &nbsp;생성
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResultsPage;
