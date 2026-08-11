// Data model for the Fund Distribution donut chart.
// Each category: { id, name, percent, color, subItems: [{ name, percent, color }] }
// `color` is the donut segment colour; sub-item colours are tints/shades of it.

export const INFINITO_FUND_TOTAL = 1234654;

export const fundDistribution = [
  {
    id: 'national',
    name: 'Nation Development',
    percent: 20,
    color: '#DE1215', // light red
    subItems: [
      { name: 'Youth & Sports', percent: 10, color: '#DE1215' },
      { name: 'Environmental Protection', percent: 5, color: '#EF4444' },
      { name: 'Child Protection', percent: 3, color: '#F87171' },
      { name: "Social Justice & Women's Rights", percent: 2, color: '#FCA5A5' },
    ],
  },
  {
    id: 'research',
    name: 'Research & Innovation',
    percent: 35,
    color: '#693434', // dark maroon
    subItems: [
      { name: 'Future Technologies', percent: 20, color: '#693434' },
      { name: 'Drone Technology & Robotics', percent: 10, color: '#9D6C6C' },
      { name: 'Social & Economic Research', percent: 5, color: '#BD9C9C' },
    ],
  },
  {
    id: 'development',
    name: 'Development of Infinito Universe',
    percent: 45,
    color: '#9CA3AF', // grey
    subItems: [
      { name: 'Content Production', percent: 40, color: '#6B7280' },
      { name: 'Technology Improvement', percent: 5, color: '#9CA3AF' },
    ],
  },
];

export default fundDistribution;
