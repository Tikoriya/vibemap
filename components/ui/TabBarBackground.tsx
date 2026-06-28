import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

// Web / Android shim. The floating tab bar overlays content on every platform,
// so screens offset by its measured height (reported via the height callback).
export default undefined;

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
