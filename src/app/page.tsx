'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { events, laterNote, notes, questions, type EventItem } from './data';
import styles from './page.module.css';

const PASSWORD = 'Битва экстрасенсов';

type Screen = 'lock' | 'welcome' | 'desktop';
type Folder = 'events' | 'notes' | 'quiz' | 'later';

const folders: { id: Folder; title: string; icon: string }[] = [
  { id: 'events', title: 'События', icon: '▧' },
  { id: 'notes', title: 'Записки', icon: '✎' },
  { id: 'quiz', title: 'Квизик', icon: '♡' },
  { id: 'later', title: 'На потом', icon: '✉' },
];

export default function Home() {
  const appRef = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [catStretching, setCatStretching] = useState(false);
  const [petCount, setPetCount] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [musicMessage, setMusicMessage] = useState('');
  const [screen, setScreen] = useState<Screen>('lock');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [folder, setFolder] = useState<Folder | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;

      if (selectedEvent) {
        setSelectedEvent(null);
      } else if (folder) {
        if (quizFinished) {
          setQuestionIndex(0);
          setSelectedAnswer(null);
          setScore(0);
          setQuizFinished(false);
        }
        setFolder(null);
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [folder, selectedEvent, quizFinished]);

  function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.trim().toLocaleLowerCase() === PASSWORD.toLocaleLowerCase()) {
      setError('');
      setPassword('');
      setScreen('welcome');
    } else {
      setError('Не то. Возможно, что-то другое?');
    }
  }

  function resetQuiz() {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  }

  function nextQuestion() {
    if (selectedAnswer === null) return;

    if (selectedAnswer === questions[questionIndex].correctIndex) {
      setScore((current) => current + 1);
    }

    if (questionIndex + 1 >= questions.length) {
      setQuizFinished(true);
    } else {
      setQuestionIndex((current) => current + 1);
      setSelectedAnswer(null);
    }
  }

  async function toggleMusic() {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) { audio.pause(); setMusicMessage(''); return; }
    try { await audio.play(); setMusicMessage(''); }
    catch { setMusicMessage('Не удалось включить музыку. Проверь файл public/music/husky.mp3 ♡'); }
  }
  const currentFolder = folders.find((item) => item.id === folder);
  const currentQuestion = questions[questionIndex];

  return (
    <main ref={appRef} className={`${styles.app} ${screen !== 'desktop' ? styles.introMode : styles.desktopMode}`}>
      <div className={styles.background} aria-hidden="true" />
      <div className={styles.shade} aria-hidden="true" />

      {screen === 'lock' && (
        <section key="lock" className={styles.centerScreen}>
          <form className={styles.lockCard} onSubmit={handleUnlock}>
            <span className={styles.smallLabel}>15.11.2026</span>
            <h1>Otter Club</h1>

            <label className={styles.fieldLabel} htmlFor="password">
              Что мы смотрели 15.11.2025?
            </label>

            <input
              id="password"
              className={styles.input}
              type="text"
              inputMode="text"
              lang="ru"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
              placeholder="Твой ответ"
              autoComplete="off"
            />

            {error && (
              <p className={styles.error} role="alert">{error}</p>
            )}

            <button className={styles.primaryButton} type="submit">Открыть</button>
          </form>
        </section>
      )}

      {screen === 'welcome' && (
        <section key="welcome" className={styles.centerScreen}>
          <div className={`${styles.lockCard} ${styles.welcomeCard}`}>
            <h1>с любовью</h1>
            <p className={styles.intro}>Добро пожаловать в наше маленькое место.</p>
            <button
              className={styles.primaryButton}
              type="button"
              onClick={() => setScreen("desktop")}
            >
              Войти<span>→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "desktop" && (
        <>
          <audio ref={audioRef} src="/music/husky.mp3" preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
          <div className={styles.interactionLayer}>
            <div className={styles.roomCanvas}>
              {catStretching && <div key={petCount} className={styles.catPatch} onAnimationEnd={() => setCatStretching(false)} aria-hidden="true" />}
              {petCount > 0 && <span key={petCount} className={styles.catHeart} aria-hidden="true">♥</span>}
              <button className={`${styles.roomHotspot} ${styles.catHotspot}`} aria-label="Погладить кота" onClick={() => { setCatStretching(true); setPetCount((count) => count + 1); }} type="button" />
              <button className={`${styles.roomHotspot} ${styles.recordHotspot}`} aria-label={playing ? 'Остановить музыку' : 'Включить музыку'} onClick={toggleMusic} type="button" />
              <button className={`${styles.roomHotspot} ${styles.letterHotspot}`} aria-label="Открыть письмо на потом" onClick={() => setFolder('later')} type="button" />
            </div>
          </div>
          {musicMessage && <div className={styles.musicNotice} role="status">{musicMessage}<button type="button" onClick={() => setMusicMessage('')} aria-label="Закрыть">×</button></div>}

          <div className={styles.desktop}>
            <div className={styles.desktopGreeting}>
            </div>

            <nav className={styles.folderGrid} aria-label="Папки">
              {folders.map((item) => (
                <button
                  className={styles.folderButton}
                  key={item.id}
                  type="button"
                  onClick={() => setFolder(item.id)}
                >
                  <span className={styles.folderIcon} aria-hidden="true">
                    {item.icon}
                  </span>
                  <span>{item.title}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.dock} aria-label="Быстрый доступ">
            {folders.map((item) => (
              <button
                key={item.id}
                type="button"
                title={item.title}
                aria-label={item.title}
                onClick={() => setFolder(item.id)}
              >
                {item.icon}
              </button>
            ))}
          </div>
        </>
      )}

      {screen === "desktop" && folder && (
        <div
          className={styles.overlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setFolder(null);
          }}
        >
          <section
            className={styles.window}
            role="dialog"
            aria-modal="true"
            aria-labelledby="folder-title"
          >
            <div className={styles.windowBar}>
              <button
                className={styles.closeButton}
                type="button"
                aria-label="Закрыть папку"
                onClick={() => setFolder(null)}
              >
                ×
              </button>
              <h2 id="folder-title">{currentFolder?.title}</h2>
              <span aria-hidden="true">♡</span>
            </div>

            <div className={styles.windowContent}>
              {folder === "events" && (
                <>
                  <p className={styles.sectionHint}>
                    Тык на фотографию лапкой.
                  </p>
                  <div className={styles.eventGrid}>
                    {events.map((item) => (
                      <button
                        className={styles.eventCard}
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedEvent(item)}
                      >
                        <span
                          className={styles.eventImage}
                          style={{ backgroundImage: `url("${item.image}")` }}
                        >
                          <span>♡</span>
                        </span>
                        <strong>{item.title}</strong>
                        <small>{item.date}</small>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {folder === "notes" && (
                <div className={styles.notesGrid}>
                  {notes.map((note) => (
                    <article className={`${styles.note} ${styles.photoNote}`} key={note.id}>
                      <div className={styles.notePhoto} aria-hidden="true"><Image src={note.image} alt="" width={1200} height={1200} unoptimized /></div>
                      <div className={styles.noteBody}>
                        <span className={styles.noteHeart}>♡</span>
                        <h3>{note.title}</h3>
                        <p>{note.text}</p>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {folder === "quiz" && (
                <div
                  key={quizFinished ? 'result' : currentQuestion?.id ?? 'empty'}
                  className={styles.quiz}
                  style={{ backgroundImage: `linear-gradient(180deg, rgba(38, 18, 15, .53), rgba(38, 18, 15, .83)), url("${currentQuestion?.image ?? '/pics/pic-6.jpg'}")` }}
                >
                  {questions.length === 0 ? (
                    <p>Скоро здесь появятся вопросы.</p>
                  ) : quizFinished ? (
                    null
                  ) : (
                    <>
                      <span className={styles.smallLabel}>
                        ВОПРОС {questionIndex + 1} / {questions.length}
                      </span>
                      <h3>{currentQuestion.question}</h3>

                      <div className={styles.answers}>
                        {currentQuestion.options.map((option, index) => (
                          <button
                            className={`${styles.answer} ${
                              selectedAnswer === index ? styles.answerSelected : ""
                            }`}
                            type="button"
                            key={`${currentQuestion.id}-${index}`}
                            aria-pressed={selectedAnswer === index}
                            onClick={() => setSelectedAnswer(index)}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      <button
                        className={styles.primaryButton}
                        type="button"
                        disabled={selectedAnswer === null}
                        onClick={nextQuestion}
                      >
                        {questionIndex + 1 === questions.length
                          ? "Узнать результат"
                          : "Следующий вопрос"}
                      </button>
                    </>
                  )}
                </div>
              )}

              {folder === "later" && (
                <article className={`${styles.note} ${styles.letter}`}>
                  <div className={styles.notePhoto} aria-hidden="true"><Image src="/pics/pic-6.jpg" alt="" width={1200} height={1200} unoptimized /></div>
                  <div className={styles.noteBody}>
                  <span className={styles.noteHeart}>✉</span>
                  <h3>На потом</h3>
                  <p>{laterNote}</p>
                  <span className={styles.signature}>с любовью ♡</span>
                  </div>
                </article>
              )}
            </div>
          </section>
        </div>
      )}

      {screen === "desktop" && folder === "quiz" && quizFinished && (
        <div className={`${styles.overlay} ${styles.resultOverlay}`}>
          <section className={styles.resultCard} role="dialog" aria-modal="true" aria-labelledby="quiz-result-title" aria-describedby="quiz-result-score">
            <span className={styles.resultSparkle} aria-hidden="true">✦ ♡ ✦</span>
            <span className={styles.resultEyebrow}>НАШИ ВОСПОМИНАНИЯ</span>
            <h2 id="quiz-result-title">{score === questions.length ? "Всё правильно!" : "Квиз пройден!"}</h2>
            <p id="quiz-result-score">Правильных ответов: <strong>{score} из {questions.length}</strong></p>
            <p>{score === questions.length ? "Ты помнишь каждую деталь нашей истории ♡" : "Впереди ещё столько моментов, которые мы запомним вместе ♡"}</p>
            <div className={styles.resultActions}>
              <button className={styles.primaryButton} type="button" onClick={resetQuiz}>Попробовать ещё раз</button>
              <button className={styles.resultClose} type="button" onClick={() => { setFolder(null); resetQuiz(); }}>Вернуться в комнату</button>
            </div>
          </section>
        </div>
      )}

      {selectedEvent && (
        <div
          className={`${styles.overlay} ${styles.eventOverlay}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedEvent(null);
          }}
        >
          <article
            className={`${styles.window} ${styles.eventModal}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-title"
          >
            <div className={styles.windowBar}>
              <button
                className={styles.closeButton}
                type="button"
                aria-label="Закрыть воспоминание"
                onClick={() => setSelectedEvent(null)}
              >
                ×
              </button>
              <span>ВОСПОМИНАНИЕ</span>
              <span aria-hidden="true">♡</span>
            </div>

            <div
              className={styles.eventHero}
              style={{ backgroundImage: `url("${selectedEvent.image}")` }}
              role="img"
              aria-label={selectedEvent.title}
            >
              <span>♡</span>
            </div>

            <div className={styles.eventText}>
              <span className={styles.smallLabel}>{selectedEvent.date}</span>
              <h2 id="event-title">{selectedEvent.title}</h2>
              <p>{selectedEvent.text}</p>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}