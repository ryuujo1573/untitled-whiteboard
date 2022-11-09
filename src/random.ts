
let testId = 0

export const randomId = () => {
    // test env
    return `id-${testId++}`
}