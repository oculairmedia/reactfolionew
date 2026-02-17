import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { meta, portfolioPage } from "../../content_option";
import { getPortfolioItems } from "../../utils/payloadApi";
import PortfolioItem from "../../components/PortfolioItem";
import { PortfolioPageSkeleton } from "../../components/SkeletonLoader";
import type { PortfolioItem as PortfolioItemType } from "../../types";

export const Portfolio: React.FC = () => {
  const [dataportfolio, setDataPortfolio] = useState<PortfolioItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const portfolioData = await getPortfolioItems();
        setDataPortfolio(portfolioData);
      } catch {
        import("../../content_option").then((module) => {
          setDataPortfolio(module.dataportfolio);
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return (
    <HelmetProvider>
      <div className="min-h-screen bg-base-100">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <Helmet>
            <meta charSet="utf-8" />
            <title>Portfolio | {meta.title}</title>
            <meta name="description" content={meta.description} />
          </Helmet>

          {loading ? (
            <PortfolioPageSkeleton count={8} />
          ) : (
            <div className="animate-[fadeIn_0.3s_ease_forwards]">
              {/* Header */}
              <div className="mb-10 mt-6 md:pt-6 pl-2 md:pl-0">
                <div className="lg:w-2/3">
                  <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-base-content mb-4">
                    {portfolioPage.title}
                  </h1>
                  <div className="divider my-4 before:bg-base-content/20 after:bg-base-content/20"></div>
                </div>
              </div>

              {/* Portfolio Grid */}
              <div className="mb-10 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5">
                {dataportfolio && dataportfolio.length > 0 ? (
                  dataportfolio.map((data, i) => (
                    <PortfolioItem key={data.id || i} data={data} index={i} />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <p className="text-base-content/60 font-mono text-sm uppercase tracking-wider">
                      No portfolio items available
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </HelmetProvider>
  );
};
