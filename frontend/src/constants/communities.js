import gradient from '../../assets/Images/Community/gradient.png';

import fanartimg1 from "../../assets/Images/Community/fanartimg1.png";
import fanartimg2 from "../../assets/Images/Community/fanartimg2.png";

import post from '../../assets/Images/Community/post.png';
import post2 from '../../assets/Images/Community/post.png';

import eventimg1 from '../../assets/Images/Community/eventimg1.png';
import eventimg2 from '../../assets/Images/Community/eventimg2.png';
import eventimg3 from '../../assets/Images/Community/eventimg3.png';

// Array of event image assets
export const eventImages = [
  eventimg1, eventimg2, eventimg3, eventimg1, eventimg2, eventimg3
];

export const communities = [
  {
    name: "General",
    imageUrl: gradient, // Replace with actual image
  },
  {
    name: "Infinito Core",
    imageUrl: gradient, // Replace with actual image
  },
  {
    name: "Anti–Hero Group",
    imageUrl: gradient, // Replace with actual image
  },
];

export const posts = [
  {
    username: "russian_loki",
    time: "10 mins ago",
    text: "A long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    imageUrl: post, // Post image
    avatarUrl: "",  // Avatar image
    likes: "2.5K",
    comments: "2.5K",
    shares: "2.5K",
  },
  {
    username: "russian_loki",
    time: "10 mins ago",
    text: "A long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    imageUrl: post,
    avatarUrl: "",
    likes: "2.5K",
    comments: "2.5K",
    shares: "2.5K",
  },
];


// Dummy fan art data
export const artworks = [
  {
    artist: "Artist Name",
    image: post2,        // Fan art image
    likes: "2.5k",
  },
  {
    artist: "Artist Name",
    image: fanartimg1,  // Fan art image
    likes: "2.5k",
  },
  {
    artist: "Artist Name",
    image: fanartimg2,  // Fan art image
    likes: "2.5k",
  },
];