import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentData } from '../../hooks/useDocumentData';
import { DocumentCard } from './DocumentCard';
import { DocumentModal } from './DocumentModal';
import { AddDocumentModal } from './AddDocumentModal';
import { useAuth } from '../../auth/AuthContext';

const categorii = ["Toate", "Contracte", "Cereri", "Penal", "Civil"];
const ITEMS_PER_PAGE = 8; // Number of documents to show per page

const DocumentePrestabilite = () => {
    const { documents, loading, error, addNewDocument } = useDocumentData();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();

    const [categorieSelectata, setCategorieSelectata] = useState("Toate");
    const [documentIdToOpen, setDocumentIdToOpen] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // 1. Pagination State
    const [currentPage, setCurrentPage] = useState(1);

    // 2. Filter Logic
    const filtrate = documents.filter(doc => {
        const matchesCategory = categorieSelectata === "Toate" || doc.categorie === categorieSelectata;
        const docTitle = (doc.titlu || doc.title || doc.nume || "").toLowerCase();
        const matchesSearch = docTitle.includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // 3. Pagination Calculations
    const totalPages = Math.ceil(filtrate.length / ITEMS_PER_PAGE);
    const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
    const currentDocuments = filtrate.slice(indexOfFirstItem, indexOfLastItem);

    // Handlers
    const handleCategoryChange = (cat) => {
        setCategorieSelectata(cat);
        setCurrentPage(1); // Reset to page 1 when category changes
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to page 1 when searching
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Smooth scroll to top of grid
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleOpenDocument = (docId) => {
        const documentToOpen = documents.find(doc => doc.id === docId);
        if (!documentToOpen) return;

        if (documentToOpen.type === "pdf" && documentToOpen.url) {
            window.open(documentToOpen.url, "_blank");
            return;
        }
        if (documentToOpen.continut) {
            setDocumentIdToOpen(docId);
            return;
        }
        alert("Acest document nu are nici URL de PDF, nici conținut text.");
    };

    const handleCloseModal = () => {
        setDocumentIdToOpen(null);
    };

    const handleAddButtonClick = () => {
        if (!isLoggedIn) {
            alert("Trebuie să fii autentificat pentru a adăuga documente.");
            navigate('/login');
            return;
        }
        setIsAddModalOpen(true);
    };

    const handleAddDocument = async (newDoc) => {
        await addNewDocument(newDoc);
    };

    if (loading) {
        return (
            <div style={styles.centerContainer}>
                <style>{`
                    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                    .spinner { width: 40px; height: 40px; border: 4px solid #E5E7EB; border-top: 4px solid #4F46E5; border-radius: 50%; animation: spin 1s linear infinite; }
                `}</style>
                <div className="spinner"></div>
                <p style={styles.loadingText}>Se încarcă biblioteca...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centerContainer}>
                <div style={styles.errorCard}>
                    <h3 style={styles.errorTitle}>A apărut o eroare</h3>
                    <p style={styles.errorText}>{error}</p>
                    <button onClick={() => window.location.reload()} style={styles.retryButton}>Încearcă din nou</button>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.pageBackground}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                body { margin: 0; font-family: 'Inter', sans-serif; background-color: #F9FAFB; }
                
                .category-chip { transition: all 0.2s ease; }
                .category-chip:hover { transform: translateY(-1px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .category-chip:active { transform: translateY(0); }
                
                .search-input:focus { border-color: #4F46E5 !important; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1) !important; outline: none; }
                
                .page-btn:hover:not(:disabled) { background-color: #F3F4F6; border-color: #9CA3AF; }
                .page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
                
                .add-btn:hover { background-color: #4338ca !important; }
            `}</style>

            <div style={styles.container}>
                <header style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Biblioteca Juridică</h1>
                        <p style={styles.subtitle}>Accesează modele de documente verificate și actualizate.</p>
                    </div>
                    <button 
                        onClick={handleAddButtonClick}
                        className="add-btn"
                        style={styles.addButton}
                    >
                        + Adaugă Document
                    </button>
                </header>

                <div style={styles.controlsContainer}>
                    <div style={styles.searchWrapper}>
                        <span style={styles.searchIcon}>🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Caută un document (ex: Contract...)"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={styles.searchInput}
                        />
                    </div>

                    <div style={styles.filterScroll}>
                        {categorii.map(cat => {
                            const isActive = categorieSelectata === cat;
                            return (
                                <button
                                    key={cat}
                                    onClick={() => handleCategoryChange(cat)}
                                    className="category-chip"
                                    style={{
                                        ...styles.chip,
                                        ...(isActive ? styles.chipActive : styles.chipInactive)
                                    }}
                                >
                                    {cat}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {filtrate.length > 0 ? (
                    <>
                        {/* Document Grid */}
                        <div className="animate-fade-in" style={styles.grid}>
                            {currentDocuments.map(doc => (
                                <DocumentCard
                                    key={doc.id}
                                    docData={doc}
                                    onOpen={handleOpenDocument}
                                />
                            ))}
                        </div>

                        {/* 4. Pagination Controls */}
                        {totalPages > 1 && (
                            <div style={styles.paginationContainer}>
                                <button
                                    className="page-btn"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    style={styles.pageButton}
                                >
                                    ← Anterior
                                </button>

                                <span style={styles.pageInfo}>
                                    Pagina <strong>{currentPage}</strong> din <strong>{totalPages}</strong>
                                </span>

                                <button
                                    className="page-btn"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    style={styles.pageButton}
                                >
                                    Următor →
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={styles.emptyState}>
                        <div style={styles.emptyIcon}>🕵️‍♀️</div>
                        <h3 style={styles.emptyTitle}>Niciun rezultat găsit</h3>
                        <p style={styles.emptyText}>
                            Nu am găsit documente pentru "<strong>{searchTerm}</strong>" în categoria <strong>{categorieSelectata}</strong>.
                        </p>
                        <button
                            onClick={() => { setSearchTerm(""); handleCategoryChange("Toate"); }}
                            style={styles.resetButton}
                        >
                            Resetează filtrele
                        </button>
                    </div>
                )}
            </div>

            {documentIdToOpen && (
                <DocumentModal
                    documentId={documentIdToOpen}
                    onClose={handleCloseModal}
                />
            )}

            {isAddModalOpen && (
                <AddDocumentModal
                    onClose={() => setIsAddModalOpen(false)}
                    onSave={handleAddDocument}
                />
            )}
        </div>
    );
};

const styles = {
    pageBackground: { minHeight: "100vh", backgroundColor: "#F9FAFB", color: "#111827" },
    container: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" },
    centerContainer: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#F9FAFB" },

    header: { 
        marginBottom: "32px", 
        borderBottom: "1px solid #E5E7EB", 
        paddingBottom: "24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
    title: { fontSize: "30px", fontWeight: "800", color: "#111827", margin: "0 0 8px 0", letterSpacing: "-0.025em" },
    subtitle: { fontSize: "16px", color: "#6B7280", margin: 0 },
    addButton: {
        backgroundColor: "#4F46E5",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "14px",
        transition: "background-color 0.2s"
    },

    controlsContainer: { marginBottom: "32px", display: "flex", flexDirection: "column", gap: "20px" },

    searchWrapper: { position: "relative", maxWidth: "400px" },
    searchIcon: { position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "16px", pointerEvents: "none", opacity: 0.5 },
    searchInput: {
        width: "100%",
        padding: "12px 16px 12px 40px",
        borderRadius: "8px",
        border: "1px solid #D1D5DB",
        fontSize: "15px",
        color: "#1F2937",
        boxSizing: "border-box",
        transition: "all 0.2s ease",
    },

    filterScroll: { display: "flex", gap: "10px", flexWrap: "wrap" },
    chip: { padding: "8px 16px", borderRadius: "9999px", fontSize: "14px", fontWeight: "500", cursor: "pointer", border: "1px solid transparent", outline: "none" },
    chipActive: { backgroundColor: "#4F46E5", color: "white", borderColor: "#4F46E5", boxShadow: "0 4px 6px -1px rgba(79, 70, 229, 0.2)" },
    chipInactive: { backgroundColor: "white", color: "#374151", borderColor: "#D1D5DB" },

    grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px" },

    // Pagination Styles
    paginationContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "40px",
        gap: "16px",
        paddingTop: "20px",
        borderTop: "1px solid #E5E7EB"
    },
    pageButton: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1px solid #D1D5DB",
        backgroundColor: "white",
        color: "#374151",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    pageInfo: {
        fontSize: "14px",
        color: "#6B7280",
    },

    loadingText: { marginTop: "16px", color: "#6B7280", fontWeight: "500" },
    errorCard: { backgroundColor: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "12px", padding: "32px", textAlign: "center", maxWidth: "400px" },
    errorTitle: { color: "#991B1B", margin: "0 0 8px 0", fontSize: "18px" },
    errorText: { color: "#B91C1C", margin: "0 0 20px 0" },
    retryButton: { backgroundColor: "#fff", border: "1px solid #B91C1C", color: "#B91C1C", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" },

    emptyState: { textAlign: "center", padding: "60px 20px", backgroundColor: "white", borderRadius: "16px", border: "1px dashed #D1D5DB" },
    emptyIcon: { fontSize: "48px", marginBottom: "16px" },
    emptyTitle: { fontSize: "18px", fontWeight: "600", color: "#111827", margin: "0 0 8px 0" },
    emptyText: { color: "#6B7280", marginBottom: "24px" },
    resetButton: { color: "#4F46E5", background: "none", border: "none", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
};

export default DocumentePrestabilite;