'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type FruitType = 'mango' | 'banana' | 'carrot' | 'goldgrape'
type TrashType = 'redcan' | 'bluecan' | 'greencan' | 'bag' | 'bottle' | 'crushedbottle'
type ItemType = FruitType | TrashType

type Item = {
  id: number
  type: ItemType
  x: number
  y: number
  angle: number
  speed: number
  directionX: number
  directionY: number
  state: 'whole' | 'smashed' | 'eaten'
  isTrash?: boolean
  isGolden?: boolean
}

export const fruitImages = {
  mango: {
    whole: '/images/fruits/whole/mango.png',
    smashed: '/images/fruits/smashed/mango.png'
  },
  banana: {
    whole: '/images/fruits/whole/banana.png',
    smashed: '/images/fruits/smashed/banana.png'
  },
  carrot: {
    whole: '/images/fruits/whole/carrot.png',
    smashed: '/images/fruits/smashed/carrot.png'
  },
  goldgrape: {
    whole: '/images/fruits/whole/goldgrape.png',
    smashed: '/images/fruits/smashed/goldgrape.png'
  }
}

export const trashImages = {
  redcan: {
    whole: '/images/trash/whole/redcan.png',
    smashed: '/images/trash/smashed/redcan.png'
  },
  bluecan: {
    whole: '/images/trash/whole/bluecan.png',
    smashed: '/images/trash/smashed/bluecan.png'
  },
  greencan: {
    whole: '/images/trash/whole/greencan.png',
    smashed: '/images/trash/smashed/greencan.png'
  },
  bag: {
    whole: '/images/trash/whole/bag.png',
    smashed: '/images/trash/smashed/bag.png'
  },
  bottle: {
    whole: '/images/trash/whole/bottle.png',
    smashed: '/images/trash/smashed/bottle.png'
  },
  crushedbottle: {
    whole: '/images/trash/whole/crushedbottle.png',
    smashed: '/images/trash/smashed/crushedbottle.png'
  }
}

export const audioFiles = Array.from({ length: 10 }, (_, i) => 
  `/audio/fruits/sound${i + 1}.mp3`
)

export const trashAudioFiles = Array.from({ length: 8 }, (_, i) => 
  `/audio/trash/sound${i + 1}.mp3`
)

export const threeInARowAudio = '/audio/special/threeInARow.mp3'
export const tenFruitsAudio = '/audio/special/tenFruits.mp3'
export const hungryAudio = '/audio/special/hungry.mp3'
export const feedMeAudio = '/audio/special/feedMe.mp3'

export default function HippoFruitFeast() {
  const [score, setScore] = useState(0)
  const [items, setItems] = useState<Item[]>([])
  const [isHippoOpen, setIsHippoOpen] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)
  const [consecutiveFruits, setConsecutiveFruits] = useState<FruitType[]>([])
  const [showThreeInARow, setShowThreeInARow] = useState(false)
  const [showCoin, setShowCoin] = useState(false)
  const [showTenFruits, setShowTenFruits] = useState(false)
  const [tenFruitsAchieved, setTenFruitsAchieved] = useState(false)
  const [idleTime, setIdleTime] = useState(0)
  const [isHippoIdle, setIsHippoIdle] = useState(false)
  const [hasPlayedHungryAudio, setHasPlayedHungryAudio] = useState(false)
  const [hasPlayedFeedMeAudio, setHasPlayedFeedMeAudio] = useState(false)
  const [ateTrash, setAteTrash] = useState(false)
  const [showFortyPoints, setShowFortyPoints] = useState(false)
  const [showGoldenBadge, setShowGoldenBadge] = useState(false)
  const [isHippoSick, setIsHippoSick] = useState(false) 
  const [trashCount, setTrashCount] = useState(0) 
  const [firstTrashEaten, setFirstTrashEaten] = useState(false) 
  const [showGameOver, setShowGameOver] = useState(false) 
  const [showWarning, setShowWarning] = useState(false) 
  const [hasShownWarning, setHasShownWarning] = useState(false)
  const [isSoundMuted, setIsSoundMuted] = useState(true)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const hippoRef = useRef<HTMLDivElement>(null)
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const trashAudioRefs = useRef<(HTMLAudioElement | null)[]>([])
  const threeInARowAudioRef = useRef<HTMLAudioElement | null>(null)
  const tenFruitsAudioRef = useRef<HTMLAudioElement | null>(null)
  const hungryAudioRef = useRef<HTMLAudioElement | null>(null)
  const feedMeAudioRef = useRef<HTMLAudioElement | null>(null)
  const lastPlayedAudioIndex = useRef<number>(-1)

  useEffect(() => {
    // Initialize audio elements with their sources
    audioRefs.current = audioFiles.map(src => {
      const audio = new Audio(src)
      audio.muted = isSoundMuted
      return audio
    })
    
    trashAudioRefs.current = trashAudioFiles.map(src => {
      const audio = new Audio(src)
      audio.muted = isSoundMuted
      return audio
    })

    // Initialize special audio elements
    threeInARowAudioRef.current = new Audio(threeInARowAudio)
    tenFruitsAudioRef.current = new Audio(tenFruitsAudio)
    hungryAudioRef.current = new Audio(hungryAudio)
    feedMeAudioRef.current = new Audio(feedMeAudio)

    // Set muted state for all audio elements
    const updateMutedState = () => {
      audioRefs.current.forEach(audio => {
        if (audio) audio.muted = isSoundMuted
      })
      trashAudioRefs.current.forEach(audio => {
        if (audio) audio.muted = isSoundMuted
      })
      if (threeInARowAudioRef.current) threeInARowAudioRef.current.muted = isSoundMuted
      if (tenFruitsAudioRef.current) tenFruitsAudioRef.current.muted = isSoundMuted
      if (hungryAudioRef.current) hungryAudioRef.current.muted = isSoundMuted
      if (feedMeAudioRef.current) feedMeAudioRef.current.muted = isSoundMuted
    }

    updateMutedState()

    // Cleanup function
    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause()
          audio.src = ''
        }
      })
      trashAudioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause()
          audio.src = ''
        }
      })
    }
  }, [])

  useEffect(() => {
    audioRefs.current.forEach(audio => {
      if (audio) audio.muted = isSoundMuted
    })
    trashAudioRefs.current.forEach(audio => {
      if (audio) audio.muted = isSoundMuted
    })
    if (threeInARowAudioRef.current) threeInARowAudioRef.current.muted = isSoundMuted
    if (tenFruitsAudioRef.current) tenFruitsAudioRef.current.muted = isSoundMuted
    if (hungryAudioRef.current) hungryAudioRef.current.muted = isSoundMuted
    if (feedMeAudioRef.current) feedMeAudioRef.current.muted = isSoundMuted
  }, [isSoundMuted])

  useEffect(() => {
    if (gameStarted) {
      const idleInterval = setInterval(() => {
        setIdleTime(prevTime => prevTime + 1)
      }, 1000)

      return () => clearInterval(idleInterval)
    }
  }, [gameStarted])

  useEffect(() => {
    if (idleTime >= 7 && !isHippoIdle) {
      setIsHippoIdle(true)
      setHasPlayedHungryAudio(false)
      setHasPlayedFeedMeAudio(false)
    }
  }, [idleTime, isHippoIdle])

  useEffect(() => {
    if (isHippoIdle) {
      const toggleInterval = setInterval(() => {
        setIsHippoOpen(prev => !prev)
      }, 500)

      if (!hasPlayedHungryAudio && hungryAudioRef.current) {
        hungryAudioRef.current.play()
        setHasPlayedHungryAudio(true)
      }

      const feedMeTimeout = setTimeout(() => {
        if (!hasPlayedFeedMeAudio && feedMeAudioRef.current) {
          feedMeAudioRef.current.play()
          setHasPlayedFeedMeAudio(true)
        }
      }, 2000)

      return () => {
        clearInterval(toggleInterval)
        clearTimeout(feedMeTimeout)
      }
    }
  }, [isHippoIdle, hasPlayedHungryAudio, hasPlayedFeedMeAudio])

  const resetIdleTime = () => {
    setIdleTime(0)
    setIsHippoIdle(false)
    setIsHippoOpen(false)
    setHasPlayedHungryAudio(false)
    setHasPlayedFeedMeAudio(false)
    setAteTrash(false)
    setIsHippoSick(false) 
  }

  const getHippoRect = () => {
    if (hippoRef.current && gameAreaRef.current) {
      const rect = hippoRef.current.getBoundingClientRect()
      const gameRect = gameAreaRef.current.getBoundingClientRect()
      return {
        left: ((rect.left - gameRect.left) / gameRect.width) * 100,
        right: ((rect.right - gameRect.left) / gameRect.width) * 100,
        top: ((rect.top - gameRect.top) / gameRect.height) * 100,
        bottom: ((rect.bottom - gameRect.top) / gameRect.height) * 100,
        width: (rect.width / gameRect.width) * 100,
        height: (rect.height / gameRect.height) * 100,
      }
    }
    return { left: 0, right: 0, top: 0, bottom: 0, width: 0, height: 0 }
  }

  const spawnItem = () => {
    if (!gameAreaRef.current) return

    const hippoRect = getHippoRect()
    const hippoCenter = {
      x: hippoRect.left + hippoRect.width / 2,
      y: hippoRect.top + hippoRect.height / 2
    }

    let x = 0
    let y = 0
    const side = Math.floor(Math.random() * 3)

    switch (side) {
      case 0:
        x = Math.random() * 100
        y = -10
        break
      case 1:
        x = -10
        y = Math.random() * 50
        break
      case 2:
        x = 110
        y = Math.random() * 50
        break
    }

    const angle = Math.atan2(hippoCenter.y - y, hippoCenter.x - x)
    const directionX = Math.cos(angle)
    const directionY = Math.sin(angle)

    const shouldSpawnTrash = score >= 200 && Math.random() < 0.3
    const shouldSpawnGolden = score >= 25 && Math.random() < 0.1 && !shouldSpawnTrash

    let type: ItemType
    let isTrash = false
    let isGolden = false

    if (shouldSpawnTrash) {
      const trashTypes: TrashType[] = ['redcan', 'bluecan', 'greencan', 'bag', 'bottle', 'crushedbottle']
      type = trashTypes[Math.floor(Math.random() * trashTypes.length)]
      isTrash = true
    } else if (shouldSpawnGolden) {
      type = 'goldgrape'
      isGolden = true
    } else {
      const fruitTypes: FruitType[] = ['mango', 'banana', 'carrot']
      type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)]
    }

    const newItem: Item = {
      id: Date.now(),
      type,
      x,
      y,
      angle: angle * (180 / Math.PI),
      speed: 0.5 + Math.random() * 0.5,
      directionX,
      directionY,
      state: 'whole',
      isTrash,
      isGolden
    }
    setItems(prevItems => [...prevItems, newItem])
  }

  useEffect(() => {
    if (gameStarted) {
      const itemInterval = setInterval(spawnItem, 1000)
      return () => clearInterval(itemInterval)
    }
  }, [gameStarted, score])

  useEffect(() => {
    if (gameStarted) {
      const moveItems = setInterval(() => {
        const hippoRect = getHippoRect()
        setItems(prevItems =>
          prevItems.map(item => {
            if (item.state === 'eaten') return null
            const newX = item.x + item.directionX * item.speed
            const newY = item.y + item.directionY * item.speed
            
            if (newX > hippoRect.left && newX < hippoRect.right &&
                newY > hippoRect.top && newY < hippoRect.top + hippoRect.height / 2) {
              return { ...item, x: newX, y: newY, state: 'whole' }
            }
            
            if (newY > hippoRect.bottom) {
              return null
            }
            
            return { ...item, x: newX, y: newY }
          }).filter(Boolean) as Item[]
        )
      }, 16)
      return () => clearInterval(moveItems)
    }
  }, [gameStarted])

  const playRandomAudio = (isTrash: boolean | undefined) => {
    if (isSoundMuted) return
    
    const audioArray = isTrash ? trashAudioRefs.current : audioRefs.current
    let randomIndex
    do {
      randomIndex = Math.floor(Math.random() * audioArray.length)
    } while (randomIndex === lastPlayedAudioIndex.current)
    
    const audio = audioArray[randomIndex]
    if (audio) {
      // Create a new Audio instance for each play to allow overlapping sounds
      const newAudio = new Audio(audio.src)
      newAudio.muted = isSoundMuted
      newAudio.play()
        .catch(error => console.error("Audio playback failed:", error))
      lastPlayedAudioIndex.current = randomIndex
    }
  }

  const playThreeInARowAudio = () => {
    if (isSoundMuted || !threeInARowAudioRef.current) return;
    threeInARowAudioRef.current.currentTime = 0
    threeInARowAudioRef.current.play().catch(error => console.error("Audio playback failed:", error))
  }

  const playTenFruitsAudio = () => {
    if (isSoundMuted || !tenFruitsAudioRef.current) return;
    tenFruitsAudioRef.current.currentTime = 0
    tenFruitsAudioRef.current.play().catch(error => console.error("Audio playback failed:", error))
  }

  const handleClick = () => {
    if (gameStarted) {
      resetIdleTime()
      setIsHippoOpen(true)
      setTimeout(() => setIsHippoOpen(false), 200)

      setItems(prevItems => {
        let eaten = false
        return prevItems.map(item => {
          if (!eaten && item.state === 'whole') {
            const hippoRect = getHippoRect()
            if (item.x > hippoRect.left && item.x < hippoRect.right &&
                item.y > hippoRect.top && item.y < hippoRect.top + hippoRect.height / 2) {
              eaten = true
              
              if (item.isGolden) {
                setShowGoldenBadge(true)
                playThreeInARowAudio()
                setTimeout(() => {
                  setShowGoldenBadge(false)
                  setShowFortyPoints(true)
                  setTimeout(() => {
                    setShowFortyPoints(false)
                    setScore(prevScore => prevScore + 40)
                  }, 2000)
                }, 2000)
              } else {
                setScore(prevScore => {
                  const points = item.isTrash ? -30 : 1
                  const newScore = prevScore + points
                  if (newScore >= 190 && !hasShownWarning) {
                    setShowWarning(true)
                    setHasShownWarning(true)
                    setTimeout(() => setShowWarning(false), 2000)
                  }
                  if (newScore === 10 && !tenFruitsAchieved) {
                    setShowTenFruits(true)
                    setTenFruitsAchieved(true)
                    playTenFruitsAudio()
                    setTimeout(() => setShowTenFruits(false), 2000)
                  }
                  return newScore
                })
              }

              playRandomAudio(item.isTrash)
              
              if (!item.isTrash && !item.isGolden) {
                setConsecutiveFruits(prev => {
                  const newConsecutive = [...prev, item.type as FruitType]
                  if (newConsecutive.length > 3) {
                    newConsecutive.shift()
                  }
                  return newConsecutive
                })
              }
              
              if (item.isTrash) {
                setAteTrash(true)
                setIsHippoSick(true)
                if (!firstTrashEaten) {
                  setFirstTrashEaten(true)
                  setTimeout(() => setFirstTrashEaten(false), 2000)
                }
                setTrashCount(prev => {
                  console.log(trashCount)
                  const newCount = prev + 1
                  if (newCount >= 10) {
                    setShowGameOver(true)
                    setIsSoundMuted(true)
                  }
                  return newCount
                })
              } else {
                setAteTrash(false)
                setIsHippoSick(false)
              }
              
              return { ...item, state: 'eaten' }
            }
          }
          return item
        })
      })

      setTimeout(() => {
        setItems(prevItems => prevItems.filter(item => item.state !== 'eaten'))
      }, 200)
    }
  }


  useEffect(() => {
    if (consecutiveFruits.length === 3 &&
        consecutiveFruits[0] === consecutiveFruits[1] &&
        consecutiveFruits[1] === consecutiveFruits[2]) {
      setShowThreeInARow(true)
      playThreeInARowAudio()
      setScore(prevScore => prevScore + 20)
      setTimeout(() => {
        setShowThreeInARow(false)
        setShowCoin(true)
      }, 2000)
      setTimeout(() => {
        setShowCoin(false)
      }, 4000)
      setConsecutiveFruits([])
    }
  }, [consecutiveFruits])

  const resetGame = () => {
    setScore(0)
    setItems([])
    setConsecutiveFruits([])
    setTenFruitsAchieved(false)
    resetIdleTime()
    setTrashCount(0)
    setFirstTrashEaten(false)
    setShowGameOver(false)
    setShowWarning(false)
    setHasShownWarning(false)
    setIsSoundMuted(true)
    setIsHippoSick(false)
    lastPlayedAudioIndex.current = -1
  }

  const startGame = () => {
    setGameStarted(true)
    setIsSoundMuted(false)
    resetGame()
  }

  const getItemImage = (item: Item) => {
    if (item.isTrash) {
      return trashImages[item.type as TrashType][item.state === 'eaten' ? 'smashed' : 'whole']
    }
    return fruitImages[item.type as FruitType][item.state === 'eaten' ? 'smashed' : 'whole']
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div 
        className="relative w-full max-w-[calc(100vh*9/16)] aspect-[9/16] overflow-hidden border-8 border-orange-500"
        ref={gameAreaRef} 
        onMouseDown={handleClick}
        style={{
          backgroundImage: gameStarted 
            ? "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_pstacdpstacdpsta-LDu6w3yS9ICcIc8gNgR7NRZyK9gt8M.jpeg')"
            : "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-10-28%20at%203.06.57%E2%80%AFPM-ppVHFtj2vd9eFxdSlLtrwCdTEknPSi.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <button
          onClick={() => setIsSoundMuted(!isSoundMuted)}
          className="absolute top-4 left-4 z-30 bg-white bg-opacity-50 p-2 rounded-full"
        >
          {isSoundMuted ? "🔇" : "🔊"}
        </button>
        {!gameStarted ? (
          <div className="absolute inset-0 flex items-end justify-center pb-[8%]">
            <button 
              onMouseDown={startGame}
              className="bg-transparent text-transparent text-2xl font-bold py-4 px-24 rounded-full"
              style={{
                position: 'absolute',
                bottom: '8%',
                width: '80%',
                height: '10%',
              }}
            >
              START
            </button>
          </div>
        ) : (
          <>
            <div className="absolute top-4 right-4 z-30" style={{ right: '4px' }}>
              <div 
                className="relative w-40 h-16 flex items-center justify-center"
                style={{
                  backgroundImage: "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_4x907z4x907z4x90%20Background%20Removed-YIjNyEXA0MA1mZ2P6XV8dF2aM6XlJs.png')",
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center'
                }}
              >
                <span className="text-xl font-bold text-white drop-shadow-lg px-2">
                  {score}
                </span>
              </div>
            </div>
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.id}
                  className="absolute"
                  style={{ 
                                        left: `${item.x}%`, 
                    top: `${item.y}%`, 
                    transform: `rotate(${item.angle}deg)`,
                    transition: 'transform 0.1s linear',
                    zIndex: 20
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0                 }}
                >
                  <img 
                    src={getItemImage(item)}
                    alt={`${item.state} ${item.type}`}
                    className={`object-contain ${item.isGolden ? 'w-24 h-24' : item.isTrash ? 'w-24 h-24' : 'w-16 h-16'}`}
                  />
                </motion.div>
              ))}
              {!firstTrashEaten && ateTrash && (
                                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_v3e4u8v3e4u8v3e4%20Background%20Removed-Y2nRrpJ3arNzDw825JAxvXqf9O9f0l.png"
                    alt="Trash Eaten -30"
                    className="w-64 h-64 object-contain"
                  />
                </motion.div>
              )}
              {showGoldenBadge && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    rotate: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    scale: 1.2,
                    transition: { duration: 0.3 }
                  }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_1bcyu01bcyu01bcy%20Background%20Removed-D5yiV0roJOqr9SpclGRr1FYMqYvYE7.png"
                    alt="Golden Fruit"
                    className="w-64 h-64 object-contain"
                  />
                </motion.div>
              )}
              {showWarning && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_xe79rtxe79rtxe79%20Background%20Removed-VLVJiFa3jwn6h4zrkMuwUy09WhMOs3.png"
                    alt="Warning: Rowdy Tourists"
                    className="w-96 h-96 object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div               className="absolute bottom-0 left-1/2 transform -translate-x-1/2 mb-4"
              ref={hippoRef}
              style={{ zIndex: 10 }}
            >
              <div className="relative">
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-12 bg-black opacity-20 rounded-full blur-md"></div>
                <img
                  src={isHippoOpen || isHippoIdle
                    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_lu7gellu7gellu7g%20Background%20Removed-oPoZ0FH5w0SUGQgjcBV3ifoqwJp2St.png"
                    : isHippoSick
                    ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_njtcarnjtcarnjtc%20Background%20Removed%20Background%20Removed-GAcWRdx7tCbZVDcuPAOSpiqZWGJtnB.png"
                    : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_njtcarnjtcarnjtc%20Background%20Removed-org0F9fiReUpWAZjg9L8ASeJHs4WBO.png"
                  }
                  alt="Hippo"
                  className="w-64 h-64 object-contain relative z-10"
                />
              </div>
            </div>
            <AnimatePresence>
              {showThreeInARow && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                                        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_qw1uylqw1uylqw1u%20Background%20Removed-6ERE44VS0KI57PDABtkuiv0ZaE5Tob.png"
                    alt="3 in a row"
                    className="w-64 h-64 object-contain"
                  />
                </motion.div>
              )}
              {showCoin && (
                <motion.div
                  className="absolute z-50"
                  initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%', left: '50%', top: '50%' }}
                  animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', left: '50%', top: '50%' }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    x: 'calc(-50% + 150px)', 
                    y: 'calc(-50% - 150px)', 
                    left: '100%', 
                    top: '0%',
                    transition: { duration: 1, ease: 'easeInOut' }
                  }}
                  transition={{ 
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.5, ease: 'backOut' },
                    x: { duration: 1, ease: 'easeInOut' },
                    y: { duration: 1, ease: 'easeInOut' },
                    left: { duration: 1, ease: 'easeInOut' },
                    top: { duration: 1, ease: 'easeInOut' }
                  }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_glvxggglvxggglvx%20Background%20Removed-IaUkltBzpubzw2X7EjlKmT2O74D1sX.png"
                    alt="20 points"
                    className="w-32 h-32 object-contain"
                  />
                </motion.div>
              )}
              {showTenFruits && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_y1ggn6y1ggn6y1gg%20Background%20Removed-vvKeBM2HU0QN0x95CNnoNXfFYFGtBT.png"
                    alt="Good Job First 10 Fruits"
                    className="w-64 h-64 object-contain"
                  />
                </motion.div>
              )}
              {showFortyPoints && (
                <motion.div
                  className="absolute z-50"
                  initial={{ opacity: 0, scale: 0, x: '-50%', y: '-50%', left: '50%', top: '50%' }}
                  animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%', left: '50%', top: '50%' }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.5, 
                    x: 'calc(-50% + 150px)', 
                    y: 'calc(-50% - 150px)', 
                    left: '100%', 
                    top: '0%',
                    transition: { duration: 1, ease: 'easeInOut' }
                  }}
                  transition={{ 
                    opacity: { duration: 0.3 },
                    scale: { duration: 0.5, ease: 'backOut' },
                    x: { duration: 1, ease: 'easeInOut' },
                    y: { duration: 1, ease: 'easeInOut' },
                    left: { duration: 1, ease: 'easeInOut' },
                    top: { duration: 1, ease: 'easeInOut' }
                  }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_swllobswllobswll%20Background%20Removed-l81uyIRsHP8m007UyCGW70uEi9nYDH.png"
                    alt="40 points"
                    className="w-32 h-32 object-contain"
                  />
                </motion.div>
              )}
              {showGoldenBadge && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center z-50"
                  initial={{ opacity: 0, scale: 0.3, rotate: -15 }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1,
                    rotate: 0,
                    transition: {
                      type: "spring",
                      stiffness: 300,
                      damping: 20
                    }
                  }}
                  exit={{ 
                    opacity: 0,
                    scale: 1.2,
                    transition: { duration: 0.3 }
                  }}
                >
                  <img
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Gemini_Generated_Image_1bcyu01bcyu01bcy%20Background%20Removed-D5yiV0roJOqr9SpclGRr1FYMqYvYE7.png"
                    alt="Golden Fruit"
                    className="w-64 h-64 object-contain"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {showGameOver && (
              <div className="absolute inset-0 z-50">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/too%20much%20trash-nX3WA7vQGiCcSbdSheijrf0fXQog9D.png"
                  alt="Game Over"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Hippo Fruit Feast',
                        text: `I scored ${score} points in Hippo Fruit Feast!`,
                        url: window.location.href,
                      }).catch(console.error)
                    }
                  }}
                  className="absolute left-[25%] bottom-[8%] w-[22%] h-[10%] bg-transparent"
                  aria-label="Share Score"
                />
                <button
                  onClick={() => {
                    setShowGameOver(false)
                    setGameStarted(false)
                    resetGame()
                  }}
                  className="absolute right-[25%] bottom-[8%] w-[22%] h-[10%] bg-transparent"
                  aria-label="Play Again"
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}