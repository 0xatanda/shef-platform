export default function About() {
  return (
    <div>
      <section className="bg-green-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-green-700 font-semibold">
            ABOUT SHEF
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-3">
            Shantytown Empowerment Foundation
          </h1>

          <p className="max-w-3xl mt-6 text-lg text-gray-600 leading-8">
            We support communities to organise,
            identify their priorities and participate
            meaningfully in improving the places where
            they live.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="prose prose-lg max-w-none">
            <h2>Who we are</h2>

            <p>
              Shantytown Empowerment Foundation works
              alongside communities to strengthen local
              leadership, improve access to basic
              services and support inclusive and
              sustainable development.
            </p>

            <h2>Our approach</h2>

            <p>
              Our work is rooted in community
              participation, collective action,
              savings, knowledge sharing and partnerships
              that enable residents to shape solutions to
              challenges affecting their communities.
            </p>

            <h2>Our vision</h2>

            <p>
              Communities where residents have the
              knowledge, voice, resources and partnerships
              needed to create dignified and resilient
              settlements.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}