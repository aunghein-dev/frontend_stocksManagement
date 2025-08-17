import { RiShoppingCart2Line } from "react-icons/ri";

export default function FeatureCard() {
  return (
    <div className="flex flex-col items-center space-y-2 bg-gray-600 w-full min-h-[250px]">
      <RiShoppingCart2Line className="w-12 h-12 text-blue-600 p-3 rounded-full bg-blue-100"/>
    </div>
  )
}