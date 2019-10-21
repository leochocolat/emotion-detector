export default function Lerp(start, end, value) {
    return (1 - value) * start+ value * end;
}
