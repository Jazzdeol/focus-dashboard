// A small set of motivational quotes. dailyQuote() returns a stable pick for
// the current day so it only changes once a day.

export const QUOTES: string[] = [
  'Small steps every day add up to big change.',
  'Discipline is choosing what you want most over what you want now.',
  'You don\u2019t have to be extreme, just consistent.',
  'The only bad workout is the one that didn\u2019t happen.',
  'Progress, not perfection.',
  'Your future self is watching you right now through memories.',
  'Fall in love with the process and the results will come.',
  'A little progress each day adds up to big results.',
  'Take care of your body. It\u2019s the only place you have to live.',
  'Strive for progress, not perfection.',
  'The body achieves what the mind believes.',
  'Don\u2019t wish for it, work for it.',
  'Some days you won\u2019t feel like it \u2014 do it anyway.',
  'You are capable of more than you know.',
  'One day or day one. You decide.',
  'Rest when you\u2019re tired, but never quit.',
  'Be stronger than your strongest excuse.',
  'Sweat now, shine later.',
  'Good things come to those who sweat.',
  'It always seems impossible until it\u2019s done.',
  'Push yourself, because no one else is going to do it for you.',
  'Your only limit is you.',
  'Wake up with determination, go to bed with satisfaction.',
  'Success is the sum of small efforts repeated day in and day out.',
  'Make yourself proud.',
  'Slow progress is still progress.',
  'The pain you feel today is the strength you feel tomorrow.',
  'Doubt kills more dreams than failure ever will.',
  'Energy and persistence conquer all things.',
  'Today\u2019s actions are tomorrow\u2019s results.',
  'You didn\u2019t come this far to only come this far.',
  'Believe you can and you\u2019re halfway there.',
  'Little by little, a little becomes a lot.',
  'Be the energy you want to attract.',
  'Stay patient and trust your journey.',
];

export function dailyQuote(date: Date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return QUOTES[dayOfYear % QUOTES.length];
}
