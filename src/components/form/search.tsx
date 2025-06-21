type Props = {
  placeholder: string,
  onChange: (value: string) => void
}

export default function Search(props: Props) {
  return (
      <div className="relative max-w-sm flex-1">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg className="w-4 h-4 text-gray-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
            </svg>
         </div>
       <input
        type="search"
        id="default-search"
        className="block w-full px-4 py-[10px] ps-10 text-sm text-gray-900 shadow-md rounded-sm bg-gray-50 focus:ring-1 focus:ring-blue-500 focus:outline-none"
        placeholder={props.placeholder}
        required
        onChange={(e) => props.onChange(e.target.value)}
      />

      </div>
  );
}