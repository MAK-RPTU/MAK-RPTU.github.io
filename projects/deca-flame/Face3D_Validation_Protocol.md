# Validation Protocol — 3D Face Reconstruction for Surgical Use

**Project:** 3D face models from 2D photographs (DECA + FLAME 2020) on RPTU Elwetritsch HPC
**Author:** gux58lij · **Date:** 2026-07-03
**Purpose:** Define how reconstruction accuracy is measured and validated before any clinical use.

---

## 1. Aim

Establish a defensible, quantitative error budget for single-photograph 3D face reconstruction, progressing from software self-tests to a physical phantom, to volunteers with ground-truth scans, and only then to patient data. Every step reports the same set of surface-distance metrics so results are directly comparable across the ladder.

---

## 2. The metrics — what we compute

All metrics are computed in **float64 on CPU** by `~/face3d/src/metrics3d.py` (`compare_meshes`). Two surfaces are compared by sampling 50,000 points uniformly over each and computing the exact distance from every sample to the *nearest point on the other surface* (point-to-triangle, not vertex-to-vertex), in both directions.

| Metric | Definition | Why it matters for surgery |
|---|---|---|
| `chamfer_mean` | Mean of both directional mean surface distances | Overall average deviation |
| `hausdorff` | Single worst-case point distance | Sensitive to any single large error |
| `hausdorff_95` (HD95) | 95th-percentile distance | Robust worst-case; **standard in medical imaging** |
| `*_surface.rmse / mae / p95` | Point-to-surface distance statistics | The correct quantity for accuracy claims |
| `mean_signed` | Signed mean (inside/outside bias) | Detects systematic over/under-estimation |

**Regional reporting:** for surgical relevance, metrics are also reported per anatomical region (nose, cheeks, chin, forehead, periorbital), because a good global average can hide a locally poor region.

---

## 3. Why the measurement instrument is trustworthy

The metric code is validated against **analytic ground truth** (self-test, must print PASS — `python src/metrics3d.py`):

- **Translation test:** a mesh shifted by exactly 3.0 mm yields chamfer = 3.0 mm, reproduced to 12 significant digits.
- **Sphere test:** two concentric spheres of known radii yield MAE equal to the radius gap, with error ≈ 3×10⁻¹⁷ (machine precision).
- **Determinism:** fixed seeds and `CUBLAS_WORKSPACE_CONFIG=:4096:8` → identical results across runs (verified).

**Conclusion:** when two surfaces are provided, the reported distance between them is exact. What remains to be validated is not the ruler, but *what we measure with it*.

---

## 4. Honest statement of current status

- The numbers produced so far (chamfer ≈ 0.001, HD95 ≈ 0.002 FLAME units) compare DECA's **coarse mesh against its own detail mesh** — this is *internal consistency*, **not accuracy against a true face**.
- No ground-truth 3D scans have been compared yet, so a true accuracy figure is not yet established on our data.
- Published DECA accuracy on the NoW benchmark (photo vs. registered 3D scan): **~1.09 mm median / ~1.38 mm mean** — a reference target, not yet reproduced here.
- DECA outputs are in **FLAME normalized units, not millimetres.** All mm claims require scale calibration against a known reference (measured interpupillary distance, or a registered calibrated scan). Rule: `scale = known_mm / same_distance_on_mesh`.

---

## 5. Known limitations to state up front

- **Statistical model bias:** DECA/FLAME reconstruct the *most plausible* face within a learned shape space. Anatomy outside that space (large tumours, post-traumatic deformity, severe asymmetry) will be smoothed toward a normal face. This is fundamental to any single-photo 3DMM method and motivates validation on the actual patient population.
- **Weak-perspective camera:** DECA fits an orthographic camera to a perspective photo, leaving a small systematic pose residual (typically 1–3° roll). This affects the 2D overlay alignment but is removed by rigid (ICP) registration before 3D metrics are computed — pose error and shape error are separate.
- **Input resolution:** low-resolution photos (< ~500 px face width) degrade landmark detection and reconstruction. Use high-resolution, roughly frontal images.

---

## 6. Validation ladder

| Step | What | Ground truth | Purpose | Status |
|---|---|---|---|---|
| 1 | Software self-test | Analytic (translation, sphere) | Certify the metric code | ✅ Done — PASS |
| 2 | **Phantom study** | Printed STL (exact digital model) | Bound geometric pipeline error under controlled conditions | Proposed |
| 3 | Volunteer study (n ≈ 10–20) | Metrology-grade scan (3dMD / Artec) | Real-face accuracy + per-region error bars | Proposed |
| 4 | Patient data | Clinical scan / CT surface | Accuracy on target population | Requires ethics approval |

---

## 7. Phantom study — recommended design (Step 2)

**Rationale:** with a 3D-printed head the *digital ground truth is known exactly*. Printer error (~0.1–0.3 mm for SLA) is well below the expected reconstruction error (~1–2 mm), so it is a legitimate reference. No ethics approval, unlimited repeats, and full control over pose/lighting/distance/camera.

**Caveat:** DECA is trained on real human faces. A plain gray/white plastic head lacks skin texture and may make the detector/network behave atypically. **Use a realistically textured phantom** (painted, or printed from a textured scan of a real face). Treat phantom results as validating the *geometry pipeline*, not the network's generalization to skin.

**Procedure:**
1. Obtain/print a head phantom from a known STL (keep the STL as ground truth).
2. Photograph it under controlled and varied conditions: frontal + turned/tilted; near + far; even + directional lighting; high vs. low resolution.
3. Reconstruct each photo through the standard pipeline (`deca_*.sbatch`).
4. Scale each reconstruction (measured reference distance on the phantom) and rigidly register to the STL (ICP).
5. Compute global and per-region metrics vs. the STL with `compare_meshes`.

**Variables to sweep:** head pose, camera distance, lighting, image resolution. Output = the pipeline's error budget as a function of each.

---

## 8. Volunteer study — outline (Step 3)

- 10–20 volunteers, informed consent.
- Per person: one (or more) photographs **plus** a ground-truth scan from a metrology-grade scanner (3dMD, Artec, or clinic CT surface).
- Scale via measured interpupillary distance or scanner registration; ICP-align.
- Report global and **per-region** HD95 / RMSE, plus signed bias, with confidence intervals across subjects.

---

## 9. Acceptance thresholds (to agree with supervisor)

Thresholds should be set by the surgical use case *before* running the study, to avoid post-hoc justification. Suggested starting points (to be confirmed):

| Metric | Target (global) | Notes |
|---|---|---|
| RMSE | ≤ 2 mm | Consistent with published DECA performance |
| HD95 | ≤ 3 mm | Robust worst-case |
| `mean_signed` | \|bias\| ≤ 0.5 mm | No systematic over/under-estimation |

Regional thresholds may be tighter for surgically critical areas (e.g. nose, periorbital).

---

## 10. Reproducibility (already wired in)

- Fixed seeds, deterministic algorithms, `CUBLAS_WORKSPACE_CONFIG=:4096:8` → identical results across runs.
- Reconstruction in FP32; all reported metrics in float64 on CPU.
- Recorded per experiment: Slurm job ID, git commit of DECA patches, input folder, output folder.

---

*Prepared for supervisor review. Metric code and self-tests: `~/face3d/src/metrics3d.py`. Pipeline manual: `HPC_Face3D_Workflow.md`.*
