# decentralizard

```
yarn dev
```

### The concept

Decentralizard treats the news not as a feed of disconnected articles but as a living network
of streams — continuously updating threads of related stories. Every article is a node; the
graphical links between them are real relationships (shared sources, causal follow-ups,
contradicting claims, the same actors), so a reader sees not just what happened but how it
connects to everything around it. Layered on top of that topology are signal dimensions the
platform reads continuously: sentiment (which way the narrative is leaning), validity (how
well-sourced and corroborated a claim is), and resonance/impact (how far it's spreading). The
result is a clarity instrument for the world — instead of scrolling isolated headlines, you
watch clusters form, tensions surface where high-impact stories carry low validity, and
connections light up between topics that traditional media keeps in separate silos. It's news
rendered as a system you can see the shape of.

---

### Future UX journey 1 — "Follow the thread" (node-to-node exploration)

A reader opens a story on AI regulation. Beside the article, a live mini-graph shows it as a
glowing node with edges to neighbours: a prior ruling it builds on, a contradicting industry
report, two related streams. Each edge is typed and weighted — thickness = relationship
strength, colour = sentiment, a small shield = validity. The reader pulls on the
contradicting-report edge; the canvas eases that node to centre, its own neighbourhood
unfolds, and a breadcrumb "thread" records the path travelled. They've moved from a single
headline to understanding a debate without ever hitting a dead-end article — the graph is the
navigation.

### Future UX journey 2 — "Pulse lens" (signal overlays on the map)

From the home topology, the reader taps a lens toggle: Sentiment · Validity · Impact.
Switching to Validity recolours the whole graph — well-corroborated clusters glow teal,
thinly-sourced or rumour nodes fade amber, so misinformation literally looks structurally
weak. A time-scrubber lets them rewind 48 hours and watch a cluster ignite and spread; pausing
where impact is high but validity is low surfaces an "emerging, unverified" alert. The same
map, re-skinned by which signal you care about, turns "what's going on in the world?" into a
question you answer by looking rather than reading.
