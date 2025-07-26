export const LoadingSpinner = () => {
  return(
     <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-transparent bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
    </div>
  )
}
 