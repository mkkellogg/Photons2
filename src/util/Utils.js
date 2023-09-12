export class Utils {

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static currentTime() {
        return performance.now() / 1000;
    }
}
