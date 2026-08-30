// src/components/mlbb/HeroDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiOutlineArrowLeft,
  HiOutlineLightningBolt,
  HiOutlineUsers,
  HiOutlineShieldCheck,
  HiOutlineFire,
} from "react-icons/hi";
import useMLBBHeroesStore from "../../stores/useMLBBHeroesStore";
import MLBBToolsLayout from "./MLBBToolsLayout";
import Spinner from "../ui/Spinner";
import SEO from "../ui/SEO";
import { pageSEO } from "../../config/seo";
export default function HeroDetail() {
  const { heroName } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const {
    selectedHero,
    heroSkillCombos,
    heroRelations,
    heroCounters,
    heroCompatibility,
    allHeroesMap,
    loading,
    error,
    fetchHeroDetail,
    fetchSkillCombos,
    fetchRelations,
    fetchCounters,
    fetchCompatibility,
    fetchAllHeroesForMap,
    clearHeroData,
  } = useMLBBHeroesStore();

  useEffect(() => {
    if (heroName) {
      clearHeroData();
      fetchHeroDetail(heroName);
      fetchSkillCombos(heroName);
      fetchRelations(heroName);
      fetchCounters(heroName);
      fetchCompatibility(heroName);
      if (Object.keys(allHeroesMap).length === 0) {
        fetchAllHeroesForMap();
      }
    }
  }, [heroName]);

  const heroData =
    selectedHero?.data?.hero?.data || selectedHero?.data?.hero?.data || {};
  const heroSkills = heroData?.heroskilllist?.[0]?.skilllist || [];

  // Helper function to get hero name from ID
  const getHeroName = (heroId) => {
    return allHeroesMap[heroId]?.name || `Hero #${heroId}`;
  };

  // Helper function to get hero image from ID
  const getHeroImage = (heroId) => {
    return allHeroesMap[heroId]?.image || null;
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: HiOutlineUsers },
    { id: "skills", label: "Skills", icon: HiOutlineLightningBolt },
    { id: "combos", label: "Combos", icon: HiOutlineFire },
    { id: "counters", label: "Counters", icon: HiOutlineShieldCheck },
  ];

  const renderSkillDescription = (desc) => {
    return desc.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ");
  };

  // Render relation hero cards
  const renderRelationHeroes = (heroIds, type) => {
    const validIds = heroIds?.filter((id) => id !== 0) || [];

    if (validIds.length === 0) {
      return <p className="text-white/30 text-sm">No data available</p>;
    }

    return (
      <div className="space-y-2">
        <SEO
          title={pageSEO.title}
          description={pageSEO.description}
          keywords={pageSEO.keywords}
          structuredData={{
            "@context": "https://schema.org",
            "@type": "VideoGame",
            name: heroName,
            gamePlatform: "Mobile",
            genre: "MOBA",
          }}
        />
        {validIds.map((heroId, index) => (
          <div
            key={`${heroId}-${index}`}
            className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all"
          >
            {getHeroImage(heroId) ? (
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={getHeroImage(heroId)}
                  alt={getHeroName(heroId)}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎮</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <button
                onClick={() =>
                  navigate(`/tools/mlbb/hero/${getHeroName(heroId)}`)
                }
                className="text-white/70 hover:text-white text-sm font-medium truncate transition-colors"
              >
                {getHeroName(heroId)}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <MLBBToolsLayout>
      {/* Back Button */}
      <button
        onClick={() => navigate("/tools/mlbb/heroes")}
        className="flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-6"
      >
        <HiOutlineArrowLeft className="w-5 h-5" />
        Back to Heroes
      </button>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Spinner size="lg" />
          <p className="text-white/30 text-sm mt-4">Loading hero details...</p>
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h3 className="text-lg font-semibold text-white">Hero not found</h3>
          <p className="text-red-400/60 text-sm mt-2">{error}</p>
        </div>
      )}

      {!loading && !error && selectedHero && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Hero Header - Same as before */}
          <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-white/[0.02] backdrop-blur-sm mb-8">
            {/* Background Image */}
            {heroData.head_big && (
              <div className="absolute inset-0 opacity-20">
                <img
                  src={heroData.head_big}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="relative p-8 sm:p-10">
              <div className="flex items-center gap-6">
                {/* Hero Avatar */}
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-purple-500/30 to-amber-500/30 flex items-center justify-center flex-shrink-0 border border-white/5">
                  {heroData.head ? (
                    <img
                      src={heroData.head}
                      alt={heroData.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl">🎮</span>
                  )}
                </div>

                {/* Hero Info */}
                <div className="flex-1">
                  <h1 className="text-3xl sm:text-4xl font-black text-white">
                    {heroData.name}
                  </h1>

                  {heroData.difficulty && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-white/30 text-xs uppercase tracking-wider">
                        Difficulty:
                      </span>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-1.5 rounded-full ${
                              i < Math.round(parseInt(heroData.difficulty) / 20)
                                ? "bg-purple-500"
                                : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {heroData.sortid && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {heroData.sortid.map(
                        (role, index) =>
                          role.data && (
                            <span
                              key={index}
                              className="px-3 py-1 rounded-full bg-white/[0.05] text-white/60 text-xs"
                            >
                              {role.data.sort_title}
                            </span>
                          ),
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10 mb-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-t-lg text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "text-white border-b-2 border-purple-500"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Overview Tab */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  {heroRelations?.data?.relation && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <h3 className="text-green-400 font-semibold mb-3">
                          Strong Against
                        </h3>
                        {renderRelationHeroes(
                          heroRelations.data.relation.strong?.target_hero_id,
                          "strong",
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <h3 className="text-red-400 font-semibold mb-3">
                          Weak Against
                        </h3>
                        {renderRelationHeroes(
                          heroRelations.data.relation.weak?.target_hero_id,
                          "weak",
                        )}
                      </div>

                      <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                        <h3 className="text-blue-400 font-semibold mb-3">
                          Best With
                        </h3>
                        {renderRelationHeroes(
                          heroRelations.data.relation.assist?.target_hero_id,
                          "assist",
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Skills Tab - Same as before */}
              {activeTab === "skills" && (
                <div className="space-y-4">
                  {heroSkills.map((skill, index) => (
                    <div
                      key={skill.skillid || index}
                      className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                    >
                      <div className="flex items-start gap-4">
                        {skill.skillicon && (
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                            <img
                              src={skill.skillicon}
                              alt={skill.skillname}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-white font-semibold">
                            {skill.skillname}
                          </h3>
                          {skill["skillcd&cost"] && (
                            <p className="text-white/40 text-xs mt-1">
                              {skill["skillcd&cost"]}
                            </p>
                          )}
                          <p className="text-white/60 text-sm mt-2">
                            {renderSkillDescription(skill.skilldesc)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Combos Tab - Same as before */}
              {activeTab === "combos" && (
                <div className="space-y-4">
                  {heroSkillCombos.length > 0 ? (
                    heroSkillCombos.map((combo, index) => (
                      <div
                        key={combo._id || index}
                        className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex flex-wrap gap-2">
                            {combo.data?.skill_id?.map(
                              (skill, skillIndex) =>
                                skill.data?.skillicon && (
                                  <div
                                    key={skillIndex}
                                    className="w-10 h-10 rounded-lg overflow-hidden"
                                  >
                                    <img
                                      src={skill.data.skillicon}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                ),
                            )}
                          </div>
                          <p className="text-white/60 text-sm flex-1">
                            {combo.data?.desc}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-white/30">No combo guides available</p>
                    </div>
                  )}
                </div>
              )}

              {/* Counters Tab - Same as before */}
              {activeTab === "counters" && (
                <div className="space-y-4">
                  {heroCounters.length > 0 ? (
                    heroCounters.map((counter, index) => {
                      const counterData = counter.data || {};
                      return (
                        <div
                          key={counter._id || index}
                          className="p-4 rounded-2xl bg-white/[0.02] border border-white/5"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            {counterData.main_hero?.data?.head && (
                              <div className="w-12 h-12 rounded-xl overflow-hidden">
                                <img
                                  src={counterData.main_hero.data.head}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h3 className="text-white font-semibold">
                                {counterData.main_hero?.data?.name}
                              </h3>
                              <div className="flex gap-3 text-xs mt-1">
                                <span className="text-green-400">
                                  WR:{" "}
                                  {(
                                    counterData.main_hero_win_rate * 100
                                  ).toFixed(1)}
                                  %
                                </span>
                                <span className="text-red-400">
                                  BR:{" "}
                                  {(
                                    counterData.main_hero_ban_rate * 100
                                  ).toFixed(1)}
                                  %
                                </span>
                              </div>
                            </div>
                          </div>

                          {counterData.sub_hero && (
                            <div className="space-y-2">
                              {counterData.sub_hero.map((subHero, subIndex) => (
                                <div
                                  key={subIndex}
                                  className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02]"
                                >
                                  {subHero.hero?.data?.head ? (
                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={subHero.hero.data.head}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
                                      <span className="text-lg">🎮</span>
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() =>
                                          navigate(
                                            `/tools/mlbb/hero/${getHeroName(subHero.heroid)}`,
                                          )
                                        }
                                        className="text-white/70 hover:text-white text-sm truncate transition-colors"
                                      >
                                        {getHeroName(subHero.heroid)}
                                      </button>
                                      <span className="text-green-400 text-xs">
                                        +
                                        {(
                                          subHero.increase_win_rate * 100
                                        ).toFixed(1)}
                                        % WR
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-green-500 rounded-full"
                                          style={{
                                            width: `${(subHero.hero_win_rate * 100).toFixed(1)}%`,
                                          }}
                                        />
                                      </div>
                                      <span className="text-white/40 text-xs">
                                        {(subHero.hero_win_rate * 100).toFixed(
                                          1,
                                        )}
                                        %
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-white/30">No counter data available</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </MLBBToolsLayout>
  );
}
