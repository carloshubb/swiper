import { Injectable } from '@angular/core';

/**
 * Frontend Bradley-Terry Calculator
 * 
 * Lightweight client-side implementation for real-time score calculation.
 * This is "Method B" - fast visual updates without network calls.
 * 
 * The authoritative scores are calculated on backend (Method A).
 */
@Injectable({
    providedIn: 'root'
})
export class FrontendBradleyTerryService {

    /**
     * Calculate Bradley-Terry scores from image statistics
     * 
     * This is a simplified version optimized for frontend performance.
     * Uses approximate pairwise inference from like/dislike ratios.
     */
    calculateScores(imageStats: Map<string, any>): Map<string, number> {
        const scores = new Map<string, number>();

        if (imageStats.size === 0) {
            return scores;
        }

        const statsArray = Array.from(imageStats.values());

        // Initialize all scores to 1.0
        const strengths = new Map<string, number>();
        statsArray.forEach(stat => {
            strengths.set(stat.image_id, 1.0);
        });

        // Quick iterative approximation (5 iterations for speed)
        const maxIterations = 5;

        for (let iter = 0; iter < maxIterations; iter++) {
            const newStrengths = new Map<string, number>();

            for (const stat of statsArray) {
                const imageId = stat.image_id;

                // Wins = likes + 2*superlikes
                const wins = (stat.likes || 0) + 2 * (stat.superlikes || 0);

                // Denominator: sum over opponents
                let denominator = 0;

                for (const opponent of statsArray) {
                    if (opponent.image_id === imageId) continue;

                    const oppWins = (opponent.likes || 0) + 2 * (opponent.superlikes || 0);
                    const totalComparisons = wins + oppWins;

                    if (totalComparisons > 0) {
                        const currentStrength = strengths.get(imageId) || 1;
                        const opponentStrength = strengths.get(opponent.image_id) || 1;
                        denominator += totalComparisons / (currentStrength + opponentStrength);
                    }
                }

                // Update strength
                if (denominator > 0 && wins > 0) {
                    newStrengths.set(imageId, wins / denominator);
                } else {
                    newStrengths.set(imageId, strengths.get(imageId) || 1);
                }
            }

            // Copy new strengths
            newStrengths.forEach((value, key) => {
                strengths.set(key, value);
            });
        }

        // Normalize to 0-100 scale
        const strengthValues = Array.from(strengths.values());
        const minStrength = Math.min(...strengthValues);
        const maxStrength = Math.max(...strengthValues);
        const range = maxStrength - minStrength;

        if (range > 0) {
            strengths.forEach((strength, imageId) => {
                const normalized = 100 * (strength - minStrength) / range;
                scores.set(imageId, normalized);
            });
        } else {
            // All equal
            strengths.forEach((_, imageId) => {
                scores.set(imageId, 50);
            });
        }

        return scores;
    }

    /**
     * Get leaderboard sorted by Bradley-Terry scores
     */
    getLeaderboard(
        imageStats: Map<string, any>,
        limit: number = 10
    ): Array<{ image_id: string, score: number, likes: number, dislikes: number, superlikes: number }> {
        const scores = this.calculateScores(imageStats);

        const leaderboard = Array.from(imageStats.values()).map(stat => ({
            image_id: stat.image_id,
            score: scores.get(stat.image_id) || 0,
            likes: stat.likes || 0,
            dislikes: stat.dislikes || 0,
            superlikes: stat.superlikes || 0,
            total: stat.total || 0
        }));

        // Sort by score descending
        leaderboard.sort((a, b) => b.score - a.score);

        return leaderboard.slice(0, limit);
    }

    /**
     * Predict win probability between two images
     */
    predictWinProbability(
        imageId1: string,
        imageId2: string,
        scores: Map<string, number>
    ): number {
        const score1 = scores.get(imageId1) || 50;
        const score2 = scores.get(imageId2) || 50;

        // P(1 beats 2) = score1 / (score1 + score2)
        return score1 / (score1 + score2);
    }
}
