/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    collectCoverageFrom: [
        "src/**/*.ts"
    ],
    coveragePathIgnorePatterns: [
        "node_modules",
        "src/middleware",
        "src/routes",
        "src/types",
        "src/processors",
        "src/Index.ts",
        "src/ProcessorManager.ts",
        "src/CDNWorker.ts"
    ]
};