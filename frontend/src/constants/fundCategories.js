import chartDefault from '../../assets/Images/SupportUs/chartDefault.png';
import chartExpanded from '../../assets/Images/SupportUs/chartExpanded.png';

const fundCategories = [
  {
    id: 'national',
    title: "National Development",
    percentage: "20%",
    borderClass: "border-[#DE1215]",
    textColor: "text-[#DE1215]",
    collapsedItems: [
      { label: "Youth & Sports", dotColor: "#DE1215" },
      { label: "Environmental Protection", dotColor: "#DE1215" },
      { label: "Child Protection", dotColor: "#FCA5A5" },
      { label: "Social Justice & Women’s Rights", dotColor: "#FCA5A5" },
    ],
    expandedItems: [
      { label: "Youth & Sports", percent: "10%", barColor: "text-red-600 border-red-600" },
      { label: "Environmental Protection", percent: "5%", barColor: "text-red-500 border-red-500" },
      { label: "Child Protection", percent: "2%", barColor: "text-red-400 border-red-400" },
      { label: "Social Justice & Women’s Rights", percent: "2%", barColor: "text-red-300 border-red-300" },
    ],
    expandedUlClass: "pl-7",
  },
  {
    id: 'research',
    title: "Research & Innovation",
    percentage: "35%",
    borderClass: "border-[#693434]",
    textColor: "text-[#693434]",
    extraClass: "pl-1 mt-8",
    collapsedItems: [
      { label: "Future Technologies", dotColor: "#6B7280" },
      { label: "Drone Technology & Robotics", dotColor: "#6B7280" },
      { label: "Social & Economic Research", dotColor: "#6B7280" },
    ],
    expandedItems: [
      { label: "Future Technologies", percent: "20%", barColor: "text-[#693434] border-[#693434]" },
      { label: "Drone Technology & Robotics", percent: "10%", barColor: "text-[#9d6c6c] border-[#9d6c6c]" },
      { label: "Social & Economic Research", percent: "5%", barColor: "text-[#bd9c9c] border-[#bd9c9c]" },
    ],
    expandedUlClass: "pl-8",
  },
  {
    id: 'development',
    title: "Development of Infinito Universe",
    percentage: "45%",
    borderClass: "border-gray-400",
    textColor: "text-gray-400",
    extraClass: "pl-1 mt-8",
    collapsedItems: [
      { label: "Content Production", dotColor: "#9CA3AF" },
      { label: "Technology Improvement", dotColor: "#9CA3AF" },
    ],
    expandedItems: [
      { label: "Content Production", percent: "40%", barColor: "text-gray-500 border-gray-500" },
      { label: "Technology Improvement", percent: "5%", barColor: "text-gray-400 border-gray-400" },
    ],
    expandedUlClass: "pl-4 ml-4",
  }
];


export {fundCategories, chartDefault, chartExpanded};