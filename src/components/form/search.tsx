import SearchIcon from '@mui/icons-material/Search';

type Props = {
  placeholder: string,
  onChange: (value: string) => void
  value: string;
}

export default function Search(props: Props) {
  return (
      <div className="relative max-w-xs flex-1">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none mr-3">
          <SearchIcon className="text-gray-500 w-2 h-2"/>
        </div>
       <input
        type="search"
        id="default-search"
        className="search"
        placeholder={props.placeholder}
        required
        onChange={(e) => props.onChange(e.target.value)} 
      />
      </div>
  );
}