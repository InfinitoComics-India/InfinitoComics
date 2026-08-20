import React, { useEffect, useState } from 'react';
import banner from '../../../assets/Images/career/banner.png';
import logo from '../../../assets/Logo.png';
import { CheckCircle2, Share2, Globe } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTwitter, FaDiscord, FaReddit, FaYoutube } from 'react-icons/fa';
import toast from 'react-hot-toast';
import ComingSoon from '../../components/comingSoon/comingSoon';

const communities = () => {
  const comingSoonActive = false;
  const [activeTab, setActiveTab] = useState('discord');
  
  const [stats, setStats] = useState({
    discord: { online: 12, members: 384 },
    reddit: { online: 1, members: 2 }
  });

  const [inviteUrl, setInviteUrl] = useState("https://discord.com/widget?id=1537443865278029826");

  useEffect(() => {
    // 1. Fetch live Discord data
    fetch("https://discord.com/api/guilds/1537443865278029826/widget.json")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          if (data.presence_count !== undefined) {
            setStats(prev => ({
              ...prev,
              discord: {
                online: data.presence_count,
                members: Math.max(data.presence_count * 8, 384)
              }
            }));
          }
          if (data.instant_invite) {
            setInviteUrl(data.instant_invite);

            // 2. Extract invite code and fetch exact total members from the invite API
            try {
              const urlParts = data.instant_invite.split('/');
              const inviteCode = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
              if (inviteCode) {
                fetch(`https://discord.com/api/v9/invites/${inviteCode}?with_counts=true`)
                  .then((res) => res.json())
                  .then((inviteData) => {
                    if (inviteData && inviteData.approximate_member_count !== undefined) {
                      setStats(prev => ({
                        ...prev,
                        discord: {
                          online: inviteData.approximate_presence_count || data.presence_count,
                          members: inviteData.approximate_member_count
                        }
                      }));
                    }
                  })
                  .catch(() => {});
              }
            } catch (e) {
              console.error("Failed to parse invite code", e);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching Discord widget data", err);
      });

    // 3. Fetch live Reddit data
    fetch("https://www.reddit.com/r/InfinitoComics/about.json")
      .then((res) => res.json())
      .then((resJson) => {
        if (resJson && resJson.data) {
          const { active_user_count, subscribers } = resJson.data;
          setStats(prev => ({
            ...prev,
            reddit: {
              online: active_user_count || 1,
              members: subscribers || 2
            }
          }));
        }
      })
      .catch((err) => {
        console.error("Error fetching Reddit data", err);
      });
  }, []);

  const handleShare = () => {
    let shareLink = "";
    if (activeTab === 'discord') {
      shareLink = inviteUrl;
    } else if (activeTab === 'reddit') {
      shareLink = "https://www.reddit.com/r/InfinitoComics/";
    } else {
      shareLink = "https://www.instagram.com/infinitoHQ/";
    }

    navigator.clipboard.writeText(shareLink)
      .then(() => {
        toast.success(`${
          activeTab === 'discord' ? 'Discord invite' : activeTab === 'reddit' ? 'Reddit community' : 'Instagram profile'
        } link copied to clipboard!`);
      })
      .catch(() => {
        toast.error("Failed to copy link.");
      });
  };

  if (comingSoonActive) {
    return <ComingSoon />;
  }

  const isDiscord = activeTab === 'discord';
  const isReddit = activeTab === 'reddit';
  const isInstagram = activeTab === 'instagram';

  return (
    <div className="w-full min-h-screen bg-[#F2F3F5] text-black font-sans pb-20">
      <div className="max-w-[1100px] mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        
        {/* Tab Switcher Bar */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1.5 rounded-full shadow-sm flex flex-wrap gap-2 border border-gray-200">
            <button
              onClick={() => setActiveTab('discord')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                isDiscord
                  ? 'bg-[#5865F2] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaDiscord size={18} />
              Discord Server
            </button>
            <button
              onClick={() => setActiveTab('reddit')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                isReddit
                  ? 'bg-[#FF4500] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaReddit size={18} />
              Reddit Community
            </button>
            <button
              onClick={() => setActiveTab('instagram')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all cursor-pointer ${
                isInstagram
                  ? 'bg-[#E1306C] text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <FaInstagram size={18} />
              Instagram Feed
            </button>
          </div>
        </div>

        {/* Main Brand Hub Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          
          {/* Header Banner Section */}
          <div
            className="h-[200px] sm:h-[300px] md:h-[360px] relative w-full bg-cover bg-center transition-all duration-500"
            style={{
              backgroundImage: `url(${banner})`,
            }}
          >
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-black/20"></div>

            {/* Platform Branding Top Left */}
            <div className="absolute top-6 left-6 text-white flex items-center gap-2 drop-shadow-md">
              {isDiscord ? <FaDiscord size={28} /> : isReddit ? <FaReddit size={28} /> : <FaInstagram size={28} />}
              <span className="font-black text-xl tracking-wider uppercase">
                {isDiscord ? 'Discord' : isReddit ? 'Reddit' : 'Instagram'}
              </span>
            </div>

            {/* Open Button Top Right */}
            <div className="absolute top-6 right-6">
              <a
                href={isDiscord ? inviteUrl : isReddit ? "https://www.reddit.com/r/InfinitoComics/" : "https://www.instagram.com/infinitoHQ/"}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-white px-5 py-2.5 rounded-full font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md flex items-center gap-2 ${
                  isDiscord ? 'bg-[#5865F2] hover:bg-[#4752C4]' : isReddit ? 'bg-[#FF4500] hover:bg-[#e03d00]' : 'bg-[#E1306C] hover:bg-[#c12a5c]'
                }`}
              >
                {isDiscord ? <FaDiscord size={18} /> : isReddit ? <FaReddit size={18} /> : <FaInstagram size={18} />}
                {isDiscord ? 'Open Discord' : isReddit ? 'Open Reddit' : 'Open Instagram'}
              </a>
            </div>

            {/* Overlapping Logo Avatar Circle */}
            <div className="absolute -bottom-16 left-6 md:left-12 w-28 h-28 md:w-36 md:h-36 rounded-full bg-white p-1.5 shadow-md flex items-center justify-center z-10 overflow-hidden">
              <div 
                className={`w-full h-full rounded-full flex items-center justify-center p-4 transition-colors duration-500 ${
                  isDiscord ? 'bg-[#18181b]' : isReddit ? 'bg-[#ffefe9]' : 'bg-[#fff0f5]'
                }`}
              >
                <img
                  src={logo}
                  alt="Infinito Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Details Body Section */}
          <div className="pt-20 px-6 md:px-12 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Left Column: Info & Description */}
              <div className="lg:col-span-2">
                
                {/* Verified Badge & Title */}
                <div className="flex items-center flex-wrap gap-2.5 mb-3">
                  <span className="bg-[#23a55a] text-white text-[10px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                    <CheckCircle2 size={12} className="fill-white stroke-[#23a55a]" />
                    Verified
                  </span>
                  <h1 className="text-2xl md:text-3xl font-black text-gray-900 uppercase tracking-wider">
                    {isDiscord ? 'Infinito Official' : isReddit ? 'r/InfinitoComics' : 'infinitoHQ'}
                  </h1>
                </div>

                {/* Subtitle / Tagline */}
                <p className="text-gray-600 text-base md:text-lg font-medium mb-6 leading-relaxed">
                  {isDiscord 
                    ? 'This is your community home for all things Infinito! Come join the fun!'
                    : isReddit 
                      ? 'Welcome to the official home of Infinito Comics on Reddit!'
                      : 'Follow our official Instagram profile for daily updates, character art, and sneak peeks!'
                  }
                </p>

                {/* Presence & Members Stats */}
                <div className="flex items-center gap-5 text-sm font-bold text-gray-500 mb-8 border-b border-gray-100 pb-6">
                  {isDiscord && (
                    <>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#23a55a] inline-block animate-pulse"></span>
                        {stats.discord.online.toLocaleString()} Online
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b5bac1] inline-block"></span>
                        {stats.discord.members.toLocaleString()} Members
                      </span>
                    </>
                  )}
                  {isReddit && (
                    <>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#FF4500] inline-block animate-pulse"></span>
                        {stats.reddit.online.toLocaleString()} Active Users
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b5bac1] inline-block"></span>
                        {stats.reddit.members.toLocaleString()} Subscribers
                      </span>
                    </>
                  )}
                  {isInstagram && (
                    <>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#E1306C] inline-block animate-pulse"></span>
                        84 Posts
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#b5bac1] inline-block"></span>
                        1,248 Followers
                      </span>
                    </>
                  )}
                </div>

                {/* About Content */}
                <div className="mb-8">
                  <h3 className="font-sans font-extrabold text-xs tracking-widest uppercase text-gray-900 mb-3">
                    About
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base leading-relaxed font-normal">
                    {isDiscord
                      ? 'From sneak peeks and writer Q&As to fan discussions and exclusive giveaways, server membership comes with plenty of reasons to stick around. Want to show off your fan art? Chat with the creators? Discuss the latest chapters? The Infinito Official Discord server is the place to be. Join today and find your place in the universe!'
                      : isReddit
                        ? 'Welcome to the official community for Infinito Comics! Join us to discuss our latest chapters, share your fan art, chat with the creators, and connect with fellow comic book fans.'
                        : 'Stay up-to-date with daily announcements, behind-the-scenes content, exclusive artwork previews, and community highlights on our official Instagram feed.'
                    }
                  </p>
                </div>

                {/* Supported Languages */}
                <div>
                  <h3 className="font-sans font-bold text-xs tracking-widest uppercase text-gray-900 mb-2">
                    Supported Languages
                  </h3>
                  <p className="text-gray-700 text-sm md:text-base flex items-center gap-2 font-medium">
                    <Globe size={16} className="text-gray-500" />
                    English
                  </p>
                </div>
              </div>

              {/* Right Column: Interaction Sidebar */}
              <div className="flex flex-col">
                
                <div>
                  {/* Engagement Action Buttons */}
                  <div className="flex flex-col gap-3 mb-8">
                    <a
                      href={isDiscord ? inviteUrl : isReddit ? "https://www.reddit.com/r/InfinitoComics/" : "https://www.instagram.com/infinitoHQ/"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`w-full text-white py-3.5 px-4 rounded-md font-bold text-center block transition-all shadow-sm tracking-wide text-sm ${
                        isDiscord ? 'bg-[#5865F2] hover:bg-[#4752C4]' : isReddit ? 'bg-[#FF4500] hover:bg-[#e03d00]' : 'bg-[#E1306C] hover:bg-[#c12a5c]'
                      }`}
                    >
                      {isDiscord ? 'Join Server' : isReddit ? 'Join Subreddit' : 'Follow on Instagram'}
                    </a>
                    <button
                      onClick={handleShare}
                      className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 px-4 rounded-md font-bold text-center flex items-center justify-center gap-2 transition-all shadow-sm tracking-wide text-sm cursor-pointer"
                    >
                      <Share2 size={16} />
                      {isDiscord ? 'Share Server' : isReddit ? 'Share Subreddit' : 'Share Profile'}
                    </button>
                  </div>

                  {/* Categories Tags */}
                  <div className="mb-8">
                    <h3 className="font-sans font-bold text-xs tracking-widest uppercase text-gray-900 mb-3">
                      Categories
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {["Entertainment", "Fandom", "Movies & TV", "Art", "Gaming", "Comics & Cartoons"].map((category) => (
                        <span
                          key={category}
                          className="bg-[#e3e5e9] text-[#2e3035] px-3.5 py-1.5 rounded-full text-xs font-bold hover:bg-[#d0d3d9] transition-all cursor-default"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Social Channels */}
                  <div>
                    <h3 className="font-sans font-bold text-xs tracking-widest uppercase text-gray-900 mb-3">
                      Social
                    </h3>
                    <div className="flex gap-3">
                      {[
                        { icon: <FaFacebookF size={18} />, link: "https://www.facebook.com/infinitoHQ" },
                        { icon: <FaInstagram size={18} />, link: "https://www.instagram.com/infinitoHQ/" },
                        { icon: <FaTwitter size={18} />, link: "https://x.com/InfinitoHQ" },
                        { icon: <FaYoutube size={18} />, link: "https://www.youtube.com/@InfinitoHQ" }
                      ].map((social, i) => (
                        <a
                          key={i}
                          href={social.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-11 h-11 bg-[#e3e5e9] text-[#2e3035] rounded-full flex items-center justify-center hover:bg-[#d0d3d9] transition-all shadow-sm"
                        >
                          {social.icon}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default communities;
