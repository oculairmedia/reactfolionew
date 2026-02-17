import React, { memo } from "react";

interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton = memo<SkeletonProps>(
  ({ width, height, circle = false, className = "", style }) => {
    const sizeClasses = [];
    if (width) sizeClasses.push(`w-[${width}]`);
    if (height) sizeClasses.push(`h-[${height}]`);

    return (
      <div
        className={`skeleton ${circle ? "rounded-full" : ""} ${className}`}
        style={{
          width: width || "100%",
          height: height || "20px",
          ...style,
        }}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

export const PortfolioItemSkeleton = memo(() => (
  <div className="aspect-[4/3] w-full">
    <div className="skeleton w-full h-full"></div>
  </div>
));

PortfolioItemSkeleton.displayName = "PortfolioItemSkeleton";

interface PortfolioGridSkeletonProps {
  count?: number;
  className?: string;
}

export const PortfolioGridSkeleton = memo<PortfolioGridSkeletonProps>(
  ({ count = 6 }) => (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <PortfolioItemSkeleton key={index} />
      ))}
    </>
  ),
);

PortfolioGridSkeleton.displayName = "PortfolioGridSkeleton";

interface PortfolioPageSkeletonProps {
  count?: number;
}

export const PortfolioPageSkeleton = memo<PortfolioPageSkeletonProps>(
  ({ count = 8 }) => (
    <>
      {/* Header */}
      <div className="mb-8 mt-6 md:pt-6">
        <div className="lg:w-2/3">
          <div className="skeleton h-12 w-64 mb-4"></div>
          <div className="divider my-4"></div>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-0.5">
        <PortfolioGridSkeleton count={count} />
      </div>
    </>
  ),
);

PortfolioPageSkeleton.displayName = "PortfolioPageSkeleton";

export const ProjectDetailSkeleton = memo(() => (
  <div className="space-y-8">
    {/* Hero Section */}
    <div className="space-y-4">
      <div className="skeleton h-16 w-[70%]"></div>
      <div className="skeleton h-8 w-[50%]"></div>
      <div className="skeleton h-[400px] w-full"></div>
    </div>

    {/* Metadata */}
    <div className="flex flex-wrap gap-4">
      <div className="skeleton h-6 w-36"></div>
      <div className="skeleton h-6 w-36"></div>
      <div className="skeleton h-6 w-36"></div>
      <div className="skeleton h-6 w-36"></div>
    </div>

    {/* Content Section 1 */}
    <div className="space-y-3">
      <div className="skeleton h-8 w-[40%]"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-[95%]"></div>
      <div className="skeleton h-4 w-[98%]"></div>
      <div className="skeleton h-4 w-[90%]"></div>
    </div>

    {/* Content Section 2 */}
    <div className="space-y-3">
      <div className="skeleton h-8 w-[35%]"></div>
      <div className="skeleton h-4 w-full"></div>
      <div className="skeleton h-4 w-[92%]"></div>
      <div className="skeleton h-4 w-[96%]"></div>
    </div>
  </div>
));

ProjectDetailSkeleton.displayName = "ProjectDetailSkeleton";

export const HomeIntroSkeleton = memo(() => (
  <>
    {/* Video Background Skeleton */}
    <div className="w-full lg:w-[45%] h-[40vh] lg:h-full min-h-[280px] order-first lg:order-last">
      <div className="skeleton w-full h-full"></div>
    </div>

    {/* Text Content Skeleton */}
    <div className="w-full lg:w-[55%] p-4 lg:pl-[4%] flex justify-start items-center order-last lg:order-first">
      <div className="max-w-[90%] flex flex-col gap-4">
        {/* Subtitle */}
        <div className="skeleton h-5 w-48"></div>

        {/* Typewriter Title */}
        <div className="skeleton h-20 w-full max-w-lg"></div>

        {/* Description */}
        <div className="space-y-2">
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-3/4"></div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <div className="skeleton h-12 w-36"></div>
          <div className="skeleton h-12 w-36"></div>
        </div>

        {/* Social Icons */}
        <div className="flex gap-3 mt-6">
          <div className="skeleton w-9 h-9"></div>
          <div className="skeleton w-9 h-9"></div>
          <div className="skeleton w-9 h-9"></div>
        </div>
      </div>
    </div>
  </>
));

HomeIntroSkeleton.displayName = "HomeIntroSkeleton";

export const AboutPageSkeleton = memo(() => (
  <div className="space-y-12">
    {/* Header */}
    <div className="mb-8 mt-6 md:pt-6">
      <div className="lg:w-2/3">
        <div className="skeleton h-12 w-48 mb-4"></div>
        <div className="divider my-4"></div>
      </div>
    </div>

    {/* About Section */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Image Column */}
      <div className="lg:col-span-5 space-y-4">
        <div className="skeleton h-8 w-[80%]"></div>
        <div className="skeleton h-[400px] w-full"></div>
      </div>

      {/* Bio Column */}
      <div className="lg:col-span-7 flex items-center">
        <div className="space-y-2 w-full">
          <div className="skeleton h-5 w-full"></div>
          <div className="skeleton h-5 w-full"></div>
          <div className="skeleton h-5 w-[95%]"></div>
          <div className="skeleton h-5 w-[98%]"></div>
          <div className="skeleton h-5 w-full"></div>
          <div className="skeleton h-5 w-[92%]"></div>
        </div>
      </div>
    </div>

    {/* Work & Education */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <div className="skeleton h-8 w-48"></div>
      </div>
      <div className="lg:col-span-7">
        <div className="overflow-x-auto">
          <table className="table">
            <tbody>
              {Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td>
                    <div className="skeleton h-5 w-28"></div>
                  </td>
                  <td>
                    <div className="skeleton h-5 w-24"></div>
                  </td>
                  <td>
                    <div className="skeleton h-5 w-20"></div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    {/* Skills */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <div className="skeleton h-8 w-36"></div>
      </div>
      <div className="lg:col-span-7 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="skeleton h-4 w-28"></div>
            <div className="skeleton h-2 w-full"></div>
          </div>
        ))}
      </div>
    </div>

    {/* Services */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5">
        <div className="skeleton h-8 w-36"></div>
      </div>
      <div className="lg:col-span-7 space-y-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-4 space-y-2">
            <div className="skeleton h-6 w-[60%]"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-[90%]"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
));

AboutPageSkeleton.displayName = "AboutPageSkeleton";

interface TextSkeletonProps {
  lines?: number;
}

export const TextSkeleton = memo<TextSkeletonProps>(({ lines = 3 }) => (
  <div className="space-y-2">
    {Array.from({ length: lines }).map((_, index) => (
      <div
        key={index}
        className={`skeleton h-4 ${index === lines - 1 ? "w-[80%]" : "w-full"}`}
      />
    ))}
  </div>
));

TextSkeleton.displayName = "TextSkeleton";

export default Skeleton;
