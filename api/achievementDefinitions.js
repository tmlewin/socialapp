const achievementDefinitions = [
    {
        name: 'First Post',
        description: 'Create your first post',
        icon: '📝',
        criteria: (stats) => stats.postCount >= 1,
    },
    {
        name: 'Prolific Poster',
        description: 'Create 10 posts',
        icon: '✍️',
        criteria: (stats) => stats.postCount >= 10,
    },
    {
        name: 'Power Poster',
        description: 'Create 50 posts',
        icon: '🚀',
        criteria: (stats) => stats.postCount >= 50,
    },
    {
        name: 'Comment Contributor',
        description: 'Leave your first comment',
        icon: '💬',
        criteria: (stats) => stats.commentCount >= 1,
    },
    {
        name: 'Frequent Commenter',
        description: 'Leave 10 comments',
        icon: '🗨️',
        criteria: (stats) => stats.commentCount >= 10,
    },
    {
        name: 'Discussion Master',
        description: 'Leave 50 comments',
        icon: '🏆',
        criteria: (stats) => stats.commentCount >= 50,
    },
    {
        name: 'Poll Creator',
        description: 'Create your first poll',
        icon: '📊',
        criteria: (stats) => stats.pollCount >= 1,
    },
    {
        name: 'Active Voter',
        description: 'Vote in 5 polls',
        icon: '🗳️',
        criteria: (stats) => stats.voteCount >= 5,
    },
];

module.exports = achievementDefinitions;
