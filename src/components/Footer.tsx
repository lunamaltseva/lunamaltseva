import { useMemo } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const POETRY_LINES: string[] = [
  'But such a form as Grecian goldsmiths make!',
  'But the tender grace of a day that is dead \\ Will never come back to me.',
  'Though wise men at their end know dark is right...',
  'Hold fast to dreams--',
  'My friend, you would not tell with such high zest--',
  'From what I’ve tasted of desire \\ I hold with those who favor fire.',
  'Like profanation, by your leave, \\ At ten o’clock of a winter eve.',
  'In time, pretending to be blind \\ And universally unkind \\ Might really send us out of our mind.',
  'How heaven laughs out with glee',
  'A poet could not but be gay, \\ In such a jocund company:',
  'And so hold on when there is nothing in you...',
  'To you from failing hands we throw \\ The torch; be yours to hold it high.',
  'It matters not how strait the gate--',
  'And therefore never send to know for whom the bell tolls;',
  'From fearful trip the victor ship comes in with object won;',
  'And not by eastern windows only, \\ When daylight comes, comes in the light...',
  'Let me not to the marriage of true minds \\ Admit impediments;',
  'But thy eternal summer shall not fade--',
  'We few, we happy few, we band of brothers;',
  'Warm the steep cliffs lapped by the waters of Golden Sand',
  'Oh, do not ask, “What is it?” \\ Let us go and make our visit',
  'And feel its total dark sublime, \\ Though this might take me a little time.',
  'Two roads diverged in a wood, and I— \\ I took the one less traveled by;',
  'Tho\' much is taken, much abides;',
  '“Hope” is the thing with feathers -',
  'And nothing ‘gainst Time’s scythe can make defence',
  'Since then – \'tis Centuries – and yet \\ Feels shorter than the Day',
];

export default function Footer() {
  const isMobile = useIsMobile();
  const line = useMemo(
    () => POETRY_LINES[Math.floor(Math.random() * POETRY_LINES.length)],
    []
  );
  return (
    <footer className="footer">
      <div className="footer-container">
        {!isMobile && <span className="footer-name">{line}</span>}
        <a href="mailto:luna@lunamaltseva.dev" className="footer-email">
          Email Me
        </a>
      </div>
    </footer>
  );
}
