import { AtlasCarousel } from "./AtlasCarousel";
import { AtlasImageViewer } from "./AtlasImageViewer";
import { CollapsibleCaption } from "./CollapsibleCaption";

type ImgItem = { id: string; url: string; legenda: string | null; ordem?: number };

export type AtlasBlock =
  | { type: "imagem"; id: string; url: string; legenda: string | null; ordem: number }
  | { type: "grupo"; id: string; titulo: string | null; legenda: string | null; modo_legenda: string; imagens: ImgItem[]; ordem: number };

export function TopicAtlasSection({ blocks, firstItemId }: { blocks: AtlasBlock[]; firstItemId?: string }) {
  if (blocks.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {blocks.map((block, i) =>
        block.type === "grupo" ? (
          // Wrap first grupo in a div so firstItemId can be applied without modifying AtlasCarousel
          <div key={block.id} id={i === 0 ? firstItemId : undefined}>
            <AtlasCarousel
              titulo={block.titulo}
              legenda={block.legenda}
              modo_legenda={block.modo_legenda}
              imagens={block.imagens}
            />
          </div>
        ) : (
          <figure
            key={block.id}
            id={i === 0 ? firstItemId : undefined}
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border)" }}
          >
            <AtlasImageViewer src={block.url} alt={block.legenda ?? ""} />
            {block.legenda && (
              <CollapsibleCaption html={
                block.legenda.trimStart().startsWith("<")
                  ? block.legenda
                  : `<p>${block.legenda}</p>`
              } />
            )}
          </figure>
        )
      )}
    </div>
  );
}
