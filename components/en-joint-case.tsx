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
export function EnJointProductionCase({ print = false }: { print?: boolean } = {}) {
  const spec = publicTeachingCase(rawSpecification) as unknown as typeof rawSpecification;
  const result = evaluateJointProductionCase(spec);
  const bases = {
    joint: `One batch supplying ${spec.outputKgPerJointBatch.X} kg X and ${spec.outputKgPerJointBatch.Y} kg Y`,
    standaloneX: 'Supplying 1 kg of functionally equivalent X',
    standaloneY: 'Supplying 1 kg of functionally equivalent Y',
    wasteY: 'Treating 1 kg of unused Y without recovery',
  };
  const scenarios = [result.scenarios.full, result.scenarios.half, result.scenarios.none];
  const anchorPrefix = print ? 'en-print--en-docs-book-joint-production-' : '';
  const inferenceLinks = [
    { href: `#${anchorPrefix}burden-shares`, title: 'Burden Shares' },
    { href: `#${anchorPrefix}reference-supply`, title: 'Reference Supply' },
  ];

  return (
    <section
      className="teaching-case not-prose"
      aria-labelledby="en-joint-batch-case-heading"
      data-case-id={spec.caseId}
      data-case-version={spec.version}
    >
      {print ? (
        <h4 id="en-joint-batch-case-heading">
          One Co-Product Batch: Partitioning Shares, Supply Routes, and Comparative Residuals
        </h4>
      ) : (
        <h3 id="en-joint-batch-case-heading">
          One Co-Product Batch: Partitioning Shares, Supply Routes, and Comparative Residuals
        </h3>
      )}
      <p className="teaching-case-meta">Pedagogical Case · Inventory Accounting</p>
      <p className="teaching-case-note">
        The tables below provide inputs and computed outputs for quick lookup; step-by-step derivations appear in{' '}
        {inferenceLinks.map((link, index) => (
          <span key={link.href}>
            {index > 0 ? ' and ' : ''}
            <a href={link.href}>{link.title}</a>
          </span>
        ))}.
      </p>
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

      <p className="teaching-case-note">
        The double-residual summation diagnostic in the main text is neither a general rejection of all
        substitution comparisons nor a rule deciding who should receive joint savings.
      </p>
      <div className="teaching-case-conditions">
        <strong>Assumptions and Scope</strong>
        <ul>
          <li>X and Y deliver distinct material services; sharing kilograms as a unit does not make them interchangeable.</li>
          <li>The joint process outputs both co-products in fixed proportions that cannot be varied independently; standalone operations represent stipulated alternative technologies.</li>
          <li>Each operation’s inventory holds all burdens included for that operation in this example, with no overlap between operations. Other activities and elementary flows are omitted rather than assumed physically zero.</li>
          <li>The comparison is limited to operating activity changes; unchanged capital burdens lie outside this boundary and cannot be used to evaluate plant construction or investment consequences.</li>
          <li>Receiving demands for X and Y are fixed. Utilized joint Y matches standalone Y in quality, location, timing, and downstream use on a one-to-one basis; no extra processing or use-phase differences are stipulated.</li>
          <li>Standalone production can scale down by the listed amounts and the joint process can displace the listed X supply; capacity limits, price feedbacks, rebound effects, time lags, and induced activities are not modeled.</li>
          <li>Applying this structure to a real decision requires independent evidence on supplier responses and utilization share q; observing a price or sale does not by itself prove physical displacement.</li>
          <li>Prices in hypothetical currency units (CU) govern only gross-sales partitioning under full utilization; they do not govern supply routes or identify which co-product determines joint output.</li>
          <li>Physical emissions along every route are strictly positive. Negative residuals arise solely from subtracting reference supply, not from atmospheric removal, negative physical output, or intrinsic product properties.</li>
          <li>CO₂ and SO₂ retain their separate units without impact characterization or cross-flow summation and cannot establish overall environmental superiority.</li>
          <li>Partial-utilization scenarios alter explicitly stipulated service-delivery conditions and are not an application of Weidema’s rules or his corrected worked examples.</li>
        </ul>
      </div>

      <p className="teaching-case-download">
        <a href="/downloads/cases/joint-batch-v1.json" download>Download case input</a> ·{' '}
        <a href="/downloads/cases/joint-batch-v1.evaluated.json" download>Download calculation results</a>
      </p>
    </section>
  );
}
