import 'server-only';
import rawSpecification from '../knowledge/cases/joint-batch-v1.json';
import { publicTeachingCase } from '../scripts/case-publication.mjs';
import { evaluateJointProductionCase } from '../scripts/joint-production.mjs';

const operationNames = ['joint', 'standaloneX', 'standaloneY', 'wasteY'] as const;
const labels = {
  joint: 'J, joint co-product batch',
  standaloneX: 'S-X, standalone X supply',
  standaloneY: 'S-Y, standalone Y supply',
  wasteY: 'W-Y, unused Y treatment',
};
const vector = (values: string[]) => `(${values[0]} kg CO₂, ${values[1]} g SO₂)`;

/** Static server output only: uses the shared exact-arithmetic joint-production engine. */
export function EnJointProductionCase() {
  const spec = publicTeachingCase(rawSpecification) as unknown as typeof rawSpecification;
  const result = evaluateJointProductionCase(spec);
  const bases = {
    joint: `One batch supplying ${spec.outputKgPerJointBatch.X} kg X and ${spec.outputKgPerJointBatch.Y} kg Y`,
    standaloneX: 'Supplying 1 kg of functionally equivalent X',
    standaloneY: 'Supplying 1 kg of functionally equivalent Y',
    wasteY: 'Treating 1 kg of unused Y without recovery',
  };
  const scenarios = [result.scenarios.full, result.scenarios.half, result.scenarios.none];

  return (
    <section
      className="teaching-case not-prose"
      aria-labelledby="en-joint-batch-case-heading"
      data-case-id={spec.caseId}
      data-case-version={spec.version}
    >
      <h3 id="en-joint-batch-case-heading">
        One Co-Product Batch: Partitioning Shares, Supply Routes, and Comparative Residuals
      </h3>
      <p className="teaching-case-meta">Pedagogical Case · Inventory Accounting</p>
      <p>
        One batch of J rigidly outputs {spec.outputKgPerJointBatch.X} kg of X and{' '}
        {spec.outputKgPerJointBatch.Y} kg of Y. Both fulfill distinct specified material services;
        sharing kilograms as a unit does not mean they are interchangeable. All quantities, prices,
        emissions, substitution technologies, and supply responses are author-constructed assumptions.
      </p>
      <p className="teaching-case-note">
        Each vector preserves airborne fossil kg CO₂ and g SO₂ separately. The two flows are never
        summed, no LCIA characterization factors are applied, and no overall environmental superiority
        is claimed. Exact fractions reflect exact arithmetic on the declared inputs, not empirical
        measurement precision.
      </p>

      <div className="teaching-case-table" role="region" aria-label="Unit operations and two-flow pedagogical inputs" tabIndex={0}>
        <table>
          <caption>
            Included burdens across operations do not overlap; W-Y treats 1 kg of unused Y with no recovery.
          </caption>
          <thead>
            <tr>
              <th scope="col">Operation</th>
              <th scope="col">Basis per operation</th>
              <th scope="col">Fossil CO₂ (kg)</th>
              <th scope="col">SO₂ (g)</th>
            </tr>
          </thead>
          <tbody>
            {operationNames.map(name => (
              <tr key={name}>
                <th scope="row">{labels[name]}</th>
                <td>{bases[name]}</td>
                <td>{spec.inventoryPerOperation[name][0]}</td>
                <td>{spec.inventoryPerOperation[name][1]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>Question 1: How Is an Existing Batch Partitioned into Product Labels?</h4>
      <p>
        Partitioning assumes full utilization and does not model production responses. Prices are set
        at {spec.pricePerKgCU.X} CU/kg for X and {spec.pricePerKgCU.Y} CU/kg for Y, where CU is a
        hypothetical currency unit.
      </p>
      <div className="teaching-case-table" role="region" aria-label="Mass and gross-sales batch and per-kg labels" tabIndex={0}>
        <table>
          <caption>
            Batch columns retain (kg CO₂, g SO₂); per-kg columns scale to 1 kg of X or Y. Verify
            flow-by-flow conservation before comparing allocation rationales.
          </caption>
          <thead>
            <tr>
              <th scope="col">Convention</th>
              <th scope="col">X / Y share</th>
              <th scope="col">X batch label</th>
              <th scope="col">Y batch label</th>
              <th scope="col">Per kg X</th>
              <th scope="col">Per kg Y</th>
              <th scope="col">Flow sum</th>
            </tr>
          </thead>
          <tbody>
            {([
              ['Mass', result.partitions.mass],
              ['Gross sales', result.partitions.grossSales],
            ] as const).map(([name, p]) => (
              <tr key={name}>
                <th scope="row">{name}</th>
                <td>{p.shareX} / {p.shareY}</td>
                <td>{vector(p.Xbatch)}</td>
                <td>{vector(p.Ybatch)}</td>
                <td>{vector(p.XperKg)}</td>
                <td>{vector(p.YperKg)}</td>
                <td>{vector(p.sum)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h4>Question 2: Holding Both Services Fixed, What Happens When the Supply Route Changes?</h4>
      <p>
        The shared basket delivers {spec.functionalDemandKg.X} kg of X and{' '}
        {spec.functionalDemandKg.Y} kg of Y. The standalone reference route runs{' '}
        {result.referenceActivities.standaloneX} × S-X + {result.referenceActivities.standaloneY} × S-Y,
        with total inventory {vector(result.referenceBasket)}.
      </p>
      <p>
        Here q denotes the share of joint Y actually delivered to the existing Y service; unused Y
        enters W-Y, and any service shortfall is topped up by S-Y. Three deterministic delivery
        scenarios are tabulated without probability weights.
      </p>
      <div className="teaching-case-table" role="region" aria-label="Activity scaling and Y balances for the fixed basket" tabIndex={0}>
        <table>
          <caption>
            Every joint route keeps one batch of J; q changes top-up and treatment activities rather
            than granting a free credit.
          </caption>
          <thead>
            <tr>
              <th scope="col">q</th>
              <th scope="col">J / S-X / S-Y / W-Y operations</th>
              <th scope="col">Joint Y used (kg)</th>
              <th scope="col">Joint Y treated (kg)</th>
              <th scope="col">Standalone Y top-up (kg)</th>
              <th scope="col">X / Y service supplied (kg)</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.q}>
                <th scope="row">{s.q}</th>
                <td>{operationNames.map(name => s.activities[name]).join(' / ')}</td>
                <td>{s.jointYusedKg}</td>
                <td>{s.jointYwastedKg}</td>
                <td>{s.standaloneYtopUpKg}</td>
                <td>{s.balances.XserviceSuppliedKg} / {s.balances.YserviceSuppliedKg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="teaching-case-table" role="region" aria-label="Physical joint routes, full-basket changes, and X residuals" tabIndex={0}>
        <table>
          <caption>
            Vectors are (kg CO₂, g SO₂). Changes and residuals are subtractions; negative values do
            not represent physical removals.
          </caption>
          <thead>
            <tr>
              <th scope="col">q</th>
              <th scope="col">Physical joint-route inventory</th>
              <th scope="col">Joint − reference (full basket)</th>
              <th scope="col">X residual / {spec.outputKgPerJointBatch.X} kg X</th>
              <th scope="col">Residual / kg X</th>
            </tr>
          </thead>
          <tbody>
            {scenarios.map(s => (
              <tr key={s.q}>
                <th scope="row">{s.q}</th>
                <td>{vector(s.jointRoute)}</td>
                <td>{vector(s.changeJointMinusReference)}</td>
                <td>{vector(s.Xresidual)}</td>
                <td>{vector(s.XresidualPerKg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="teaching-case-download">
        <a href="/downloads/cases/joint-batch-v1.json" download>Download case input JSON</a> ·{' '}
        <a href="/downloads/cases/joint-batch-v1.evaluated.json" download>Download evaluated receipt</a>
      </p>
    </section>
  );
}
