import { assertBraveBetaInstalled } from "../../playwright.brave";

export default function globalSetup() {
  assertBraveBetaInstalled();
}
