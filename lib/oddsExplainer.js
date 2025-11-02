/**
 * Explains betting odds in simple terms
 * @param {number} odds - American odds format (negative = favorite, positive = underdog)
 * @returns {object} Explanation object with confidence level and description
 */
export function explainOdds(odds) {
  const isNegative = odds < 0;
  const absOdds = Math.abs(odds);

  // Calculate implied probability
  const impliedProbability = isNegative
    ? (absOdds / (absOdds + 100)) * 100
    : (100 / (absOdds + 100)) * 100;

  let confidence = '';
  let explanation = '';
  let color = '';
  let icon = '';

  if (isNegative) {
    // Favorite (negative odds)
    if (absOdds >= 1000) {
      confidence = 'Extremely Heavy Favorite';
      explanation = 'Expected to dominate completely';
      color = 'text-emerald-400';
      icon = '🔥🔥🔥';
    } else if (absOdds >= 500) {
      confidence = 'Heavy Favorite';
      explanation = 'Very likely to win convincingly';
      color = 'text-emerald-400';
      icon = '🔥🔥';
    } else if (absOdds >= 300) {
      confidence = 'Strong Favorite';
      explanation = 'Expected to win comfortably';
      color = 'text-green-400';
      icon = '🔥';
    } else if (absOdds >= 200) {
      confidence = 'Moderate Favorite';
      explanation = 'Favored to win';
      color = 'text-green-300';
      icon = '✓';
    } else if (absOdds >= 150) {
      confidence = 'Slight Favorite';
      explanation = 'Slightly favored';
      color = 'text-lime-300';
      icon = '↗';
    } else {
      confidence = 'Minor Favorite';
      explanation = 'Barely favored';
      color = 'text-yellow-300';
      icon = '→';
    }
  } else {
    // Underdog (positive odds)
    if (absOdds >= 1000) {
      confidence = 'Extreme Underdog';
      explanation = 'Massive upset if they win';
      color = 'text-red-400';
      icon = '❌❌❌';
    } else if (absOdds >= 500) {
      confidence = 'Heavy Underdog';
      explanation = 'Big upset potential';
      color = 'text-red-400';
      icon = '❌❌';
    } else if (absOdds >= 300) {
      confidence = 'Strong Underdog';
      explanation = 'Clear underdog status';
      color = 'text-orange-400';
      icon = '❌';
    } else if (absOdds >= 200) {
      confidence = 'Moderate Underdog';
      explanation = 'Not expected to win';
      color = 'text-orange-300';
      icon = '↘';
    } else if (absOdds >= 150) {
      confidence = 'Slight Underdog';
      explanation = 'Competitive but disadvantaged';
      color = 'text-yellow-300';
      icon = '↘';
    } else {
      confidence = 'Minor Underdog';
      explanation = 'Nearly even odds';
      color = 'text-yellow-200';
      icon = '→';
    }
  }

  return {
    odds,
    isNegative,
    impliedProbability: Math.round(impliedProbability),
    confidence,
    explanation,
    color,
    icon,
    formattedOdds: isNegative ? odds.toString() : `+${odds}`
  };
}

/**
 * Get a simple one-line explanation of the odds
 */
export function getSimpleOddsExplanation(odds) {
  const explained = explainOdds(odds);
  return `${explained.confidence} - ${explained.explanation} (~${explained.impliedProbability}% win probability)`;
}

/**
 * Compare two teams' odds
 */
export function compareOdds(team1Odds, team2Odds) {
  const team1Explained = explainOdds(team1Odds);
  const team2Explained = explainOdds(team2Odds);

  const probabilityDiff = Math.abs(team1Explained.impliedProbability - team2Explained.impliedProbability);

  let matchup = '';
  if (probabilityDiff < 5) {
    matchup = 'Even matchup - Could go either way';
  } else if (probabilityDiff < 15) {
    matchup = 'Competitive match - Slight edge to one team';
  } else if (probabilityDiff < 30) {
    matchup = 'Favored matchup - Clear advantage';
  } else {
    matchup = 'Lopsided matchup - Dominant favorite';
  }

  return {
    team1: team1Explained,
    team2: team2Explained,
    probabilityDiff,
    matchup
  };
}
