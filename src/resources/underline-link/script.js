// One function: draw the line in from the left, send it out to the right,
// then snap it back to the left (unseen) so the next hover starts fresh.
function underlineSwipe(link) {
  const enter = () => {
    link.classList.remove("is-out", "is-snap");
    link.classList.add("is-in");
  };

  const leave = () => {
    if (!link.classList.contains("is-in") || link.matches(":focus-visible")) return;
    link.classList.remove("is-in");
    link.classList.add("is-out");
  };

  // after the exit finishes, jump back to the hidden-left state with no transition
  link.addEventListener("transitionend", (e) => {
    if (e.pseudoElement !== "::after" || !link.classList.contains("is-out")) return;
    link.classList.add("is-snap");
    link.classList.remove("is-out");
    link.offsetWidth; // commit the reset before transitions come back
    link.classList.remove("is-snap");
  });

  link.addEventListener("pointerenter", enter);
  link.addEventListener("pointerleave", leave);
  link.addEventListener("focus", enter);
  link.addEventListener("blur", () => requestAnimationFrame(leave));
}

document.querySelectorAll(".u-link").forEach(underlineSwipe);
