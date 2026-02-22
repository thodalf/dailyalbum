import { useState, useEffect, useRef } from "react";

const GENRE_COLORS = {
  "Rock": "#e05c4b", "Jazz": "#c4943a", "Électronique": "#4b8fe0",
  "Hip-Hop": "#9b59b6", "Metal": "#bbb", "Folk": "#7daa58",
  "Soul/R&B": "#d4568a", "Classique": "#8b7355", "Pop": "#e07ba0", "Ambient": "#4bc4c4",
};

async function storageGet(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

async function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function StreamLink({ href, label, color, icon }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{
      display:"flex", alignItems:"center", gap:"5px", padding:"8px 13px",
      background:`${color}15`, border:`1px solid ${color}40`, borderRadius:"8px",
      color, textDecoration:"none", fontSize:"11px",
      fontFamily:"'Space Mono',monospace", fontWeight:"600", transition:"all 0.2s",
    }}
    onMouseEnter={e=>{e.currentTarget.style.background=`${color}28`;e.currentTarget.style.transform="translateY(-1px)";}}
    onMouseLeave={e=>{e.currentTarget.style.background=`${color}15`;e.currentTarget.style.transform="translateY(0)";}}
    >{icon} {label}</a>
  );
}

function AlbumLinks({ album }) {
  const q = encodeURIComponent(`${album.artist} ${album.title}`);
  return (
    <div style={{display:"flex", gap:"7px", flexWrap:"wrap"}}>
      <StreamLink href={`https://www.deezer.com/search/${q}`} label="Deezer" color="#ff0092" icon="🎵"/>
      <StreamLink href={`https://open.spotify.com/search/${q}`} label="Spotify" color="#1db954" icon="🎸"/>
      <StreamLink href={`https://music.apple.com/fr/search?term=${q}`} label="Apple Music" color="#fc3c44" icon="🍎"/>
      <StreamLink href={`https://tidal.com/search?q=${q}`} label="Tidal" color="#00fecc" icon="🌊"/>
      <StreamLink href={`https://www.qobuz.com/fr-fr/search?q=${q}`} label="Qobuz" color="#4a90d9" icon="🎼"/>
    </div>
  );
}

function YouTubeEmbed({ videoId, title, autoplay=false, startAt=0 }) {
  const src = `https://www.youtube.com/embed/${videoId}?controls=1${autoplay?`&autoplay=1&start=${startAt}`:""}`;
  return (
    <div style={{borderRadius:"14px", overflow:"hidden", boxShadow:"0 4px 24px rgba(0,0,0,0.5)"}}>
      <iframe width="100%" height="220" src={src} title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen style={{display:"block"}}
      />
      <div style={{background:"#060610", padding:"7px 12px", fontSize:"10px", color:"#444", fontFamily:"'Space Mono',monospace"}}>
        🎵 {title}
      </div>
    </div>
  );
}

// ---- Liked History Panel ----
function HistoryPanel({ likedAlbums, onClose }) {
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:100,
      background:"rgba(4,4,16,0.95)", backdropFilter:"blur(12px)",
      overflowY:"auto", padding:"28px 20px 40px",
      animation:"fadeUp 0.3s ease",
    }}>
      <div style={{maxWidth:"620px", margin:"0 auto"}}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"28px"}}>
          <div>
            <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:"24px", fontWeight:"800", color:"#f0f0f0"}}>Mes coups de ♥</h2>
            <p style={{color:"#333", fontSize:"11px", fontFamily:"'Space Mono',monospace", marginTop:"4px"}}>{likedAlbums.length} album{likedAlbums.length>1?"s":""} aimé{likedAlbums.length>1?"s":""}</p>
          </div>
          <button onClick={onClose} style={{
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)",
            borderRadius:"10px", color:"#666", padding:"10px 16px", cursor:"pointer",
            fontSize:"13px", fontFamily:"'Space Mono',monospace",
          }}>✕ FERMER</button>
        </div>

        {likedAlbums.length === 0 ? (
          <div style={{textAlign:"center", padding:"60px 0", color:"#333", fontFamily:"'Space Mono',monospace", fontSize:"12px"}}>
            Aucun album aimé pour l'instant.
          </div>
        ) : (
          likedAlbums.slice().reverse().map((album, i) => {
            const gc = GENRE_COLORS[album.genre] || "#888";
            return (
              <div key={`${album.title}-${i}`} style={{
                background:"linear-gradient(145deg,#111122,#0e0e1e)",
                border:`1px solid ${gc}25`, borderRadius:"18px",
                padding:"22px", marginBottom:"20px",
                animation:`fadeUp 0.4s ease ${i*0.06}s both`,
              }}>
                {/* Header */}
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px"}}>
                  <div>
                    <div style={{fontSize:"10px", color:gc, letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"5px"}}>{album.artist}</div>
                    <h3 style={{fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:"800", color:"#f0f0f0", marginBottom:"4px"}}>{album.title}</h3>
                    <div style={{fontSize:"10px", color:"#333", fontFamily:"'Space Mono',monospace"}}>{album.year} · {album.tracks} titres · {album.duration}</div>
                  </div>
                  <span style={{
                    background:`${gc}18`, border:`1px solid ${gc}40`, borderRadius:"16px",
                    padding:"4px 10px", fontSize:"9px", color:gc,
                    fontFamily:"'Space Mono',monospace", fontWeight:"700",
                    textTransform:"uppercase", flexShrink:0, marginLeft:"12px",
                  }}>{album.genre}</span>
                </div>

                {/* Moods */}
                <div style={{display:"flex", gap:"5px", flexWrap:"wrap", marginBottom:"12px"}}>
                  {(album.moods||[]).map(m=>(
                    <span key={m} style={{background:`${gc}10`,border:`1px solid ${gc}30`,borderRadius:"20px",padding:"2px 8px",fontSize:"9px",color:`${gc}99`}}>{m}</span>
                  ))}
                </div>

                {/* Description */}
                <p style={{color:"#777", fontSize:"13px", lineHeight:"1.7", borderLeft:`2px solid ${gc}40`, paddingLeft:"12px", fontStyle:"italic", marginBottom:"16px"}}>
                  {album.description}
                </p>

                {/* Videos */}
                {(album.youtubeIds||[]).length > 0 && (
                  <div style={{marginBottom:"16px"}}>
                    <div style={{fontSize:"9px", color:"#2a2a2a", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"10px"}}>🎬 Extraits</div>
                    <div style={{display:"flex", gap:"10px", flexWrap:"wrap"}}>
                      {album.youtubeIds.map(vid => (
                        <div key={vid.id} style={{flex:"1", minWidth:"240px"}}>
                          <YouTubeEmbed videoId={vid.id} title={vid.title} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                <div>
                  <div style={{fontSize:"9px", color:"#2a2a2a", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"10px"}}>🎧 Écouter sur</div>
                  <AlbumLinks album={album} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

// ---- Current Album View ----
function AlbumView({ album, onLike, onDislike, remaining }) {
  const gc = GENRE_COLORS[album.genre] || "#888";
  const firstVid = album.youtubeIds?.[0];
  const secondVid = album.youtubeIds?.[1];

  return (
    <div style={{animation:"fadeUp 0.5s ease both"}}>
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px"}}>
        <span style={{
          background:`${gc}20`, border:`1px solid ${gc}50`, borderRadius:"20px",
          padding:"4px 14px", fontSize:"10px", fontWeight:"700",
          color:gc, fontFamily:"'Space Mono',monospace", letterSpacing:"1.5px", textTransform:"uppercase",
        }}>{album.genre}</span>
        <span style={{fontSize:"10px", color:"#2a2a2a", fontFamily:"'Space Mono',monospace"}}>
          {remaining} restant{remaining>1?"s":""}
        </span>
      </div>

      {/* Main video - autoplay at 30s */}
      {firstVid && (
        <div style={{
          borderRadius:"18px", overflow:"hidden",
          boxShadow:`0 12px 50px ${gc}25, 0 2px 8px rgba(0,0,0,0.6)`,
          marginBottom:"22px", border:`1px solid ${gc}25`, position:"relative",
        }}>
          <iframe
            width="100%" height="320"
            src={`https://www.youtube.com/embed/${firstVid.id}?autoplay=1&start=30&controls=1`}
            title={firstVid.title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen style={{display:"block"}}
          />
          <div style={{
            position:"absolute", bottom:0, left:0, right:0,
            background:"linear-gradient(transparent,rgba(0,0,0,0.7))",
            padding:"20px 16px 12px", pointerEvents:"none",
          }}>
            <div style={{fontSize:"10px", color:"rgba(255,255,255,0.4)", fontFamily:"'Space Mono',monospace"}}>🎵 {firstVid.title}</div>
          </div>
        </div>
      )}

      {/* Artist + Title */}
      <div style={{marginBottom:"18px"}}>
        <div style={{fontSize:"11px", color:gc, letterSpacing:"3px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"7px"}}>{album.artist}</div>
        <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:"28px", fontWeight:"800", color:"#f0f0f0", margin:"0 0 6px", lineHeight:"1.15"}}>{album.title}</h2>
        <div style={{fontSize:"11px", color:"#444", fontFamily:"'Space Mono',monospace", marginBottom:"13px"}}>{album.year} · {album.tracks} titres · {album.duration}</div>
        <div style={{display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"14px"}}>
          {(album.moods||[]).map(m=>(
            <span key={m} style={{background:`${gc}15`,border:`1px solid ${gc}35`,borderRadius:"20px",padding:"3px 10px",fontSize:"10px",color:`${gc}bb`}}>{m}</span>
          ))}
        </div>
        <p style={{color:"#888", fontSize:"13px", lineHeight:"1.75", borderLeft:`2px solid ${gc}50`, paddingLeft:"14px", fontStyle:"italic"}}>{album.description}</p>
      </div>

      {/* 2nd video */}
      {secondVid && (
        <div style={{marginBottom:"18px"}}>
          <YouTubeEmbed videoId={secondVid.id} title={secondVid.title} />
        </div>
      )}

      {/* Streaming */}
      <div style={{marginBottom:"24px"}}>
        <div style={{fontSize:"9px", color:"#2a2a2a", letterSpacing:"2px", textTransform:"uppercase", fontFamily:"'Space Mono',monospace", marginBottom:"10px"}}>🎧 Écouter sur</div>
        <AlbumLinks album={album} />
      </div>

      <div style={{height:"1px", background:`linear-gradient(to right,transparent,${gc}40,transparent)`, marginBottom:"22px"}}/>

      {/* Actions */}
      <div style={{display:"flex", gap:"14px"}}>
        <button onClick={()=>onDislike(album)} style={{
          flex:1, padding:"15px",
          background:"rgba(231,76,60,0.08)", border:"1px solid rgba(231,76,60,0.25)",
          borderRadius:"14px", color:"#e74c3c", fontSize:"13px",
          cursor:"pointer", fontWeight:"700", letterSpacing:"1px",
          fontFamily:"'Space Mono',monospace", transition:"all 0.2s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(231,76,60,0.16)";e.currentTarget.style.transform="translateY(-2px)";}}
        onMouseLeave={e=>{e.currentTarget.style.background="rgba(231,76,60,0.08)";e.currentTarget.style.transform="translateY(0)";}}
        >✕ PAS POUR MOI</button>
        <button onClick={()=>onLike(album)} style={{
          flex:1, padding:"15px",
          background:`linear-gradient(135deg,${gc}cc,${gc}77)`,
          border:"none", borderRadius:"14px", color:"#fff", fontSize:"13px",
          cursor:"pointer", fontWeight:"700", letterSpacing:"1px",
          fontFamily:"'Space Mono',monospace",
          boxShadow:`0 6px 20px ${gc}40`, transition:"all 0.2s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${gc}55`;}}
        onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow=`0 6px 20px ${gc}40`;}}
        >♥ J'ADORE</button>
      </div>
    </div>
  );
}

// ---- Today's Liked Recap ----
function TodayRecap({ album, nextResetIn }) {
  const gc = GENRE_COLORS[album.genre] || "#888";
  return (
    <div style={{animation:"fadeUp 0.5s ease"}}>
      <div style={{
        textAlign:"center", padding:"24px 0 20px",
        borderBottom:"1px solid rgba(255,255,255,0.04)", marginBottom:"24px",
      }}>
        <div style={{fontSize:"36px", marginBottom:"10px"}}>🎉</div>
        <h2 style={{fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#2ecc71", marginBottom:"6px"}}>Album du jour !</h2>
        <div style={{background:"rgba(46,204,113,0.07)", border:"1px solid rgba(46,204,113,0.15)", borderRadius:"10px", padding:"10px 18px", display:"inline-block"}}>
          <div style={{fontSize:"9px", color:"#2a2a2a", marginBottom:"3px", fontFamily:"'Space Mono',monospace", letterSpacing:"1px"}}>PROCHAIN ALBUM DANS</div>
          <div style={{fontSize:"22px", fontWeight:"700", color:"#2ecc71", fontFamily:"'Space Mono',monospace"}}>{nextResetIn}</div>
        </div>
      </div>

      {/* Genre */}
      <div style={{marginBottom:"14px"}}>
        <span style={{background:`${gc}18`,border:`1px solid ${gc}40`,borderRadius:"16px",padding:"3px 12px",fontSize:"9px",fontWeight:"700",color:gc,fontFamily:"'Space Mono',monospace",textTransform:"uppercase",letterSpacing:"1px"}}>{album.genre}</span>
      </div>

      {/* Main video autoplay */}
      {album.youtubeIds?.[0] && (
        <div style={{
          borderRadius:"16px", overflow:"hidden",
          boxShadow:`0 10px 40px ${gc}22`, marginBottom:"18px",
          border:`1px solid ${gc}22`,
        }}>
          <iframe width="100%" height="280"
            src={`https://www.youtube.com/embed/${album.youtubeIds[0].id}?controls=1`}
            title={album.youtubeIds[0].title} frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen style={{display:"block"}}
          />
          <div style={{background:"#060610",padding:"7px 12px",fontSize:"10px",color:"#444",fontFamily:"'Space Mono',monospace"}}>🎵 {album.youtubeIds[0].title}</div>
        </div>
      )}

      {/* Info */}
      <div style={{marginBottom:"16px"}}>
        <div style={{fontSize:"11px",color:gc,letterSpacing:"3px",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:"6px"}}>{album.artist}</div>
        <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:"24px",fontWeight:"800",color:"#f0f0f0",marginBottom:"5px"}}>{album.title}</h3>
        <div style={{fontSize:"10px",color:"#333",fontFamily:"'Space Mono',monospace",marginBottom:"12px"}}>{album.year} · {album.tracks} titres · {album.duration}</div>
        <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px"}}>
          {(album.moods||[]).map(m=>(
            <span key={m} style={{background:`${gc}12`,border:`1px solid ${gc}30`,borderRadius:"20px",padding:"2px 9px",fontSize:"9px",color:`${gc}99`}}>{m}</span>
          ))}
        </div>
        <p style={{color:"#777",fontSize:"13px",lineHeight:"1.75",borderLeft:`2px solid ${gc}40`,paddingLeft:"12px",fontStyle:"italic"}}>{album.description}</p>
      </div>

      {/* 2nd video */}
      {album.youtubeIds?.[1] && (
        <div style={{marginBottom:"16px"}}>
          <YouTubeEmbed videoId={album.youtubeIds[1].id} title={album.youtubeIds[1].title} />
        </div>
      )}

      {/* Streaming */}
      <div>
        <div style={{fontSize:"9px",color:"#2a2a2a",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:"10px"}}>🎧 Écouter sur</div>
        <AlbumLinks album={album} />
      </div>
    </div>
  );
}

// ==================== MAIN ====================
export default function DailyAlbumApp() {
  const [queue, setQueue] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todayLiked, setTodayLiked] = useState(false);
  const [likedAlbum, setLikedAlbum] = useState(null);
  const [noMore, setNoMore] = useState(false);
  const [stats, setStats] = useState({ likes: [], dislikes: [] });
  const [nextResetIn, setNextResetIn] = useState("");
  const [ready, setReady] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const fetchedRef = useRef(false);

  useEffect(() => {
    (async () => {
      const today = new Date().toDateString();
      const saved = await storageGet("daily_album_v4");
      let needsFetch = true;
      if (saved) {
        const s = saved.stats || { likes: [], dislikes: [] };
        setStats(s);
        if (saved.date === today) {
          if (saved.todayLiked) {
            setTodayLiked(true);
            setLikedAlbum(saved.likedAlbum);
            needsFetch = false;
          } else if (saved.queue?.length && saved.currentIdx < saved.queue.length) {
            setQueue(saved.queue);
            setCurrentIdx(saved.currentIdx || 0);
            needsFetch = false;
          } else if (saved.noMore) {
            setNoMore(true);
            needsFetch = false;
          }
        }
        // Pass stats to fetch
        if (needsFetch) {
          setReady(true);
          await fetchAlbumsWithStats(s, saved);
          return;
        }
      }
      setReady(true);
      if (needsFetch && !fetchedRef.current) {
        fetchedRef.current = true;
        await fetchAlbumsWithStats({ likes: [], dislikes: [] }, null);
      }
    })();
  }, []);

  useEffect(() => {
    const upd = () => {
      const now = new Date(), mid = new Date(); mid.setHours(24,0,0,0);
      const d = mid - now;
      setNextResetIn(`${Math.floor(d/3600000)}h ${Math.floor((d%3600000)/60000)}m ${Math.floor((d%60000)/1000)}s`);
    };
    upd(); const iv = setInterval(upd, 1000); return () => clearInterval(iv);
  }, []);

  const save = async (patch) => {
    const cur = await storageGet("daily_album_v4") || {};
    await storageSet("daily_album_v4", { ...cur, date: new Date().toDateString(), ...patch });
  };

  const fetchAlbumsWithStats = async (currentStats, saved) => {
    if (fetchedRef.current && ready) return;
    fetchedRef.current = true;
    setLoading(true); setError(null); setNoMore(false); setQueue([]); setCurrentIdx(0);

    const allSeen = [
      ...(currentStats.likes || []),
      ...(currentStats.dislikes || []),
      ...(saved?.queue || []),
    ].map(a => `${a.title} de ${a.artist}`);

    const likedGenres = [...new Set((currentStats.likes||[]).map(a=>a.genre).filter(Boolean))];
    const dislikedGenres = [...new Set((currentStats.dislikes||[]).map(a=>a.genre).filter(Boolean))];
    const avoid = [...new Set(allSeen)].slice(-20);

    const prompt = `Tu es un expert musical passionné.${likedGenres.length?" L'utilisateur aime: "+likedGenres.join(", ")+".":""}${dislikedGenres.length?" Il n'aime pas: "+dislikedGenres.join(", ")+".":""}${avoid.length?"\nNe propose JAMAIS ces albums déjà présentés: "+avoid.join(", ")+".":""}

Génère exactement 5 albums RÉELS et DIFFÉRENTS sortis entre janvier 2024 et février 2026.
Réponds UNIQUEMENT avec un tableau JSON valide, sans markdown ni texte autour.

Format de chaque objet:
{"title":"...","artist":"...","genre":"Rock","year":2024,"tracks":11,"duration":"48 min","moods":["intense","sombre","énergique"],"description":"2-3 phrases sur le projet artistique et le concept de l'album.","youtubeIds":[{"id":"VRAI_ID_YOUTUBE","title":"Titre du morceau"},{"id":"VRAI_ID_YOUTUBE_2","title":"Titre du morceau 2"}]}

Genres possibles: Rock, Jazz, Électronique, Hip-Hop, Metal, Folk, Soul/R&B, Classique, Pop, Ambient
IMPORTANT: Assure-toi que les IDs YouTube sont réels et correspondent à des clips ou performances officiels de ces albums 2024-2025.`;

    try {
      /*const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,messages:[{role:"user",content:prompt}]}),
      });*/
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:JSON.stringify({
          "text": prompt,
        })
      });
      if(!res.ok) throw new Error(`Erreur API ${res.status}`);
      const data = await res.json();
      /*const text = data.content?.[0]?.text||"";
      const match = text.match(/\[[\s\S]*\]/);
      if(!match) throw new Error("Réponse invalide");*/
      //const parsed = JSON.parse(match[0]);
      const parsed = data?.candidates?.[0]?.content?.parts?.[0]?.text ? JSON.parse(data.candidates[0].content.parts[0].text) : null;
      if(!Array.isArray(parsed)||!parsed.length) throw new Error("Liste vide");
      setQueue(parsed);
      setCurrentIdx(0);
      setReady(true);
      await save({queue:parsed,currentIdx:0,stats:currentStats,noMore:false});
    } catch(e) {
      setError(e.message||"Erreur inconnue");
      setReady(true);
    }
    setLoading(false);
  };

  const handleLike = async (album) => {
    const ns = {likes:[...stats.likes,album],dislikes:stats.dislikes};
    setStats(ns); setTodayLiked(true); setLikedAlbum(album);
    await save({todayLiked:true,likedAlbum:album,stats:ns});
  };

  const handleDislike = async (album) => {
    const ns = {likes:stats.likes,dislikes:[...stats.dislikes,album]};
    setStats(ns);
    const next = currentIdx + 1;
    if (next >= queue.length) {
      setNoMore(true);
      await save({noMore:true,currentIdx:next,stats:ns});
    } else {
      setCurrentIdx(next);
      await save({currentIdx:next,stats:ns});
    }
  };

  const handleRetry = async () => {
    fetchedRef.current = false;
    await fetchAlbumsWithStats(stats, null);
  };

  const currentAlbum = queue[currentIdx];
  const remaining = queue.length - currentIdx;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700&family=Raleway:wght@300;400;600&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#080812}
        @keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:#1a1a28;border-radius:2px}
      `}</style>

      {showHistory && (
        <HistoryPanel likedAlbums={stats.likes} onClose={()=>setShowHistory(false)} />
      )}

      <div style={{
        minHeight:"100vh",
        background:"radial-gradient(ellipse at 50% 0%,#0d0d2b 0%,#080812 58%)",
        color:"#f0f0f0", fontFamily:"'Raleway',sans-serif", padding:"22px 20px 48px",
      }}>
        <div style={{maxWidth:"620px",margin:"0 auto"}}>

          {/* HEADER */}
          <div style={{
            display:"flex", justifyContent:"space-between", alignItems:"center",
            marginBottom:"28px", paddingBottom:"20px",
            borderBottom:"1px solid rgba(255,255,255,0.04)",
          }}>
            <div style={{display:"flex", alignItems:"center", gap:"12px"}}>
              <div style={{
                width:"44px",height:"44px",
                background:"linear-gradient(135deg,#e05c4b,#c4943a)",
                borderRadius:"50%", display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:"20px", boxShadow:"0 0 20px rgba(224,92,75,0.3)", flexShrink:0,
              }}>💿</div>
              <div>
                <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"22px",fontWeight:"900",background:"linear-gradient(135deg,#f5f5f5,#666)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",lineHeight:"1.1"}}>Daily Album</h1>
                <p style={{color:"#2a2a2a",fontSize:"9px",letterSpacing:"2px",textTransform:"uppercase",fontFamily:"'Space Mono',monospace"}}>un album par jour</p>
              </div>
            </div>

            <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
              {stats.likes.length > 0 && (
                <button onClick={()=>setShowHistory(true)} style={{
                  background:"rgba(46,204,113,0.08)", border:"1px solid rgba(46,204,113,0.2)",
                  borderRadius:"10px", color:"#2ecc71", padding:"8px 14px", cursor:"pointer",
                  fontSize:"10px", fontFamily:"'Space Mono',monospace", fontWeight:"700",
                  display:"flex", alignItems:"center", gap:"5px", transition:"all 0.2s",
                }}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(46,204,113,0.15)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(46,204,113,0.08)"}
                >♥ {stats.likes.length}</button>
              )}
            </div>
          </div>

          {/* CONTENT */}
          {!ready || loading ? (
            <div style={{textAlign:"center",padding:"80px 0"}}>
              <div style={{width:"50px",height:"50px",border:"2px solid rgba(224,92,75,0.1)",borderTop:"2px solid #e05c4b",borderRadius:"50%",margin:"0 auto 20px",animation:"spin 0.8s linear infinite"}}/>
              <p style={{color:"#2a2a2a",fontFamily:"'Space Mono',monospace",fontSize:"10px",letterSpacing:"2px",animation:"pulse 1.5s ease infinite"}}>SÉLECTION EN COURS...</p>
            </div>

          ) : error ? (
            <div style={{textAlign:"center",padding:"50px 20px"}}>
              <div style={{fontSize:"36px",marginBottom:"14px"}}>⚠️</div>
              <p style={{color:"#e74c3c",fontFamily:"'Space Mono',monospace",fontSize:"11px",marginBottom:"18px",lineHeight:"1.7"}}>{error}</p>
              <button onClick={handleRetry} style={{background:"transparent",border:"1px solid #e74c3c40",borderRadius:"8px",color:"#e74c3c",padding:"9px 20px",cursor:"pointer",fontFamily:"'Space Mono',monospace",fontSize:"10px"}}>↻ RÉESSAYER</button>
            </div>

          ) : todayLiked && likedAlbum ? (
            <TodayRecap album={likedAlbum} nextResetIn={nextResetIn} />

          ) : noMore ? (
            <div style={{textAlign:"center",padding:"50px 28px",background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.05)",borderRadius:"22px",animation:"fadeUp 0.4s ease"}}>
              <div style={{fontSize:"40px",marginBottom:"14px"}}>🎵</div>
              <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"20px",color:"#666",marginBottom:"8px"}}>Tous les albums évalués</h2>
              <p style={{color:"#2a2a2a",fontSize:"12px",marginBottom:"22px",lineHeight:"1.6"}}>Aucun album ne vous a convaincu aujourd'hui.<br/>Revenez demain ou essayez une nouvelle sélection.</p>
              <button onClick={handleRetry} style={{
                background:"linear-gradient(135deg,#e05c4b,#c4943a)",border:"none",
                borderRadius:"12px",padding:"14px 30px",color:"#fff",
                fontSize:"11px",fontWeight:"700",cursor:"pointer",letterSpacing:"2px",
                fontFamily:"'Space Mono',monospace",boxShadow:"0 6px 20px rgba(224,92,75,0.25)",
              }}>↻ NOUVELLE SÉLECTION</button>
            </div>

          ) : currentAlbum ? (
            <AlbumView
              key={`${currentAlbum.title}-${currentIdx}`}
              album={currentAlbum}
              onLike={handleLike}
              onDislike={handleDislike}
              remaining={remaining}
            />

          ) : null}

        </div>
      </div>
    </>
  );
}