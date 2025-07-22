"use client";

function PaginationButton({
  onClick,
  disabled,
  children,
  isActive = false,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  isActive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-2.5 py-1 rounded-xs mx-1
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition
        ${isActive ? "bg-blue-500 text-white cursor-default" : "bg-gray-100 text-gray-700 hover:bg-gray-300"}
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
}

export default function PaginationComponent({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const visiblePages = 4;
  const currentBlock = Math.floor((currentPage - 1) / visiblePages);
  const startPage = currentBlock * visiblePages + 1;
  const endPage = Math.min(startPage + visiblePages - 1, totalPages);

  const pagesToRender = [];
  for (let page = startPage; page <= endPage; page++) {
    pagesToRender.push(
      <PaginationButton key={page} onClick={() => onPageChange(page)} isActive={currentPage === page}>
        {page}
      </PaginationButton>
    );
  }

  return (
    <nav className="flex justify-center overflow-x-auto px-[1px] py-1 bg-white rounded-sm shadow-md">
      <div className="sm:inline-block hidden">
         <PaginationButton onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
        <svg className="h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        </PaginationButton>
      </div>
     

      {pagesToRender}

      <div className="sm:inline-block hidden">
         <PaginationButton onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
        <svg className="h-5 w-5 inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        </PaginationButton>
      </div>
     
    </nav>
  );
}
