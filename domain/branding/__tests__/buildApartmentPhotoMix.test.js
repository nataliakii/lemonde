import { buildApartmentPhotoMix } from "../buildApartmentPhotoMix";

describe("buildApartmentPhotoMix", () => {
  const prev = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  beforeAll(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = "demo";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME = prev;
  });

  test("returns empty when apartments have no photos", () => {
    expect(buildApartmentPhotoMix([{ photoUrl: "", gallery: [] }])).toEqual([]);
  });

  test("skips NO_PHOTO placeholders", () => {
    expect(
      buildApartmentPhotoMix([
        { photoUrl: "carsnk/NO_PHOTO", gallery: ["carsnk/NO_PHOTO"] },
      ])
    ).toEqual([]);
  });

  test("round-robins photos across apartments and builds Cloudinary URLs", () => {
    const mix = buildApartmentPhotoMix([
      {
        carNumber: "A1",
        sort: 1,
        photoUrl: "folder/a-cover",
        gallery: ["folder/a-2"],
      },
      {
        carNumber: "B1",
        sort: 2,
        photoUrl: "https://res.cloudinary.com/demo/image/upload/folder/b-cover",
        gallery: ["folder/b-2"],
      },
    ]);

    expect(mix[0]).toContain("folder/a-cover");
    expect(mix[1]).toContain("folder/b-cover");
    expect(mix[2]).toContain("folder/a-2");
    expect(mix[3]).toContain("folder/b-2");
    expect(mix.every((u) => u.startsWith("https://res.cloudinary.com/"))).toBe(
      true
    );
  });

  test("ignores non-cloudinary http urls", () => {
    expect(
      buildApartmentPhotoMix([
        {
          photoUrl: "https://example.com/x.jpg",
          gallery: ["folder/ok"],
        },
      ])
    ).toEqual(["https://res.cloudinary.com/demo/image/upload/folder/ok"]);
  });
});
