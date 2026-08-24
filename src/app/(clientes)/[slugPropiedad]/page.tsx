import { getPropiedadPorSlug } from "@/actions/propiedades/propiedades";
import HeroPropiedad from "@/components/Propiedades/HeroPropiedad";
import { FormBuscarUnidades } from "@/app/commons/Forms/FormBuscarUnidades";

export const metadata = {
  title: "Propiedades",
  description: "Página inicial",
};

interface Props {
  params: {
    slugPropiedad: string;
  };
}

export default async function Propiedad({ params }: Props) {
  const { slugPropiedad } = params;

  const propiedad = await getPropiedadPorSlug(slugPropiedad);

  return (
    <>
      <div>
        <div className="mb-10">
          <HeroPropiedad propiedad={propiedad} />
        </div>

        <FormBuscarUnidades propiedad={propiedad} />
      </div>
    </>
  );
}
