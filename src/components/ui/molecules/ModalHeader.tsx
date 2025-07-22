import CloseIcon from '@mui/icons-material/Close';

export const ModalHeader = (props: {
  title: string,
  onClick: () => void,
  haveExitButton?: boolean
}) => {
  return (
    <div className="flex flex-row items-center justify-between max-h-[60px] border-b border-gray-200 pr-4">
        {/* Header */}
        <div className="p-5
                      bg-transparent text-lg font-bold
                      text-gray-800 flex ">
          {props.title}
        </div>
        {/* Close Button */}
        {
          props.haveExitButton &&
          <button
              onClick={props.onClick}
              className=" text-gray-500 hover:text-gray-700">
              <CloseIcon className="w-6 h-6" />
          </button>
        }
       
      </div>
  );
};